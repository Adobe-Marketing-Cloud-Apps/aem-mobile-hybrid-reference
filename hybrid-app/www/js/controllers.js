angular.module('hybridapp.controllers', ['hybridapp.services'])

    .controller('AppCtrl', ['$scope', '$rootScope', '$ionicModal', '$timeout', 'appManifest', 'appState', '$rootElement', 'TargetService',
        function ($scope, $rootScope, $ionicModal, $timeout, appManifest, appState, $rootElement, TargetService) {

            // With the new view caching in Ionic, Controllers are only called
            // when they are recreated or on app start, instead of every page change.
            // To listen for when this page is active (for example, to refresh data),
            // listen for the $ionicView.enter event:
            //$scope.$on('$ionicView.enter', function(e) {
            //});

            // Form data for the login modal
            $scope.loginData = {};
            $scope.isLoggedIn = false;

            // Initialize authorization code
            // TODO: clean this up
            var manifestData;
            var auth;
            appManifest.getData(function (error, data) {
                manifestData = data;

                var server = manifestData['serverURL'];
                if (typeof server !== 'undefined' && server.charAt(server.length - 1) === '/') {
                    server = server.substr(0, server.length - 1);
                }

                manifestData.server = server;

            });

            // Initialize the contentUpdater
            // Use app name as ContentSync package ID
            var appName = $rootElement.attr('ng-app');
            var contentUpdater = CQ.mobile.contentUpdate({
                id: appName,
                // Indicate that self-signed certificates should be trusted
                // should be set to `false` in production.
                trustAllHosts: false
            });

            //set the target service data mapping object
            TargetService.setMapping({
                'gender': 'profile.gender'
            });

            // Create the login modal that we will use later
            $ionicModal.fromTemplateUrl('templates/login.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });

            // Open the login modal
            $scope.showLogin = function () {
                $scope.modal.show();
            };

            // Triggered in the login modal to close it
            $scope.closeLogin = function () {
                $scope.modal.hide();
            };

            // Handle Basic Auth
            $scope.doBasicLogin = function () {
                $scope.errorMessage = null;
                var loginParams = {
                    server: manifestData.server,
                    resource: 'content/mobileapps/hybrid-reference-app/en',
                    username: $scope.loginData.username,
                    password: $scope.loginData.password
                };

                auth = new cq.mobileapps.auth.BasicAuth(loginParams);
                var profileProvider = cq.mobileapps.provider.ProfileProviderRegistry.getProvider(auth);

                auth.authorize(function callback(error) {
                    if (error) {
                        $scope.errorMessage = 'BasicAuth failed';
                    }
                    else {

                        $scope.isLoggedIn = true;
                        // populate profile
                        profileProvider.fetch(function (error, profile) {
                            if (!error && profile) {
                                $rootScope.profileImage = manifestData.server + profile.path + '/photos/primary/image';
                                $rootScope.currentProfile = profile;
                                TargetService.setData(profile);
                            }
                        });
                        $scope.closeLogin();
                    }
                });
            };

            //Handle OAuth
            $scope.doOAuthLogin = function () {
                $scope.errorMessage = null;

                cq.mobileapps.util.file.fetchJSON("MobileAppsConfig.json", function (error, data) {
                    if (data && data.oauth) {
                        auth = new cq.mobileapps.auth.OAuth({
                            'server': manifestData.server,
                            'client_id': data.oauth.clientId,
                            'client_secret': data.oauth.clientSecret,
                            'redirect_uri': data.oauth.redirectURI
                        });

                        auth.authorize(function (error) {
                            var profileProvider = cq.mobileapps.provider.ProfileRegistry.getProvider(auth);

                            if (error) {
                                console.log("authentication error " + error);
                            } else {
                                $scope.isLoggedIn = true;
                                appState.setAuth(auth);
                                // populate profile
                                profileProvider.fetch(function (error, profile) {
                                    if (!error && profile) {
                                        $rootScope.profileImage = manifestData.server + profile.path + '/photos/primary/image';
                                        $rootScope.currentProfile = profile;
                                        TargetService.setData(profile);
                                    }
                                });
                                $scope.closeLogin();
                            }
                        });
                    }
                }, "oauth");
            };

            $scope.logout = function () {
                auth.logout(function (error) {
                    if (error) {
                        // NOOP
                    }
                    else {
                        $scope.isLoggedIn = false;
                        $rootScope.profileImage = null;
                        $rootScope.currentProfile = null;
                        $scope.loginData = {};
                        TargetService.setData(null);
                    }
                });
            };

            // Hide the "TAP TO CLOSE", on the login modal, link when keyboard is shown
            window.addEventListener('native.keyboardshow', function () {
                document.body.classList.add('keyboard-open');
            });

            // Update the app
            $scope.updateApp = function (contentPackageName) {
                contentUpdater.isContentPackageUpdateAvailable(contentPackageName,
                    function callback(error, isUpdateAvailable) {
                        if (error) {
                            // Alert the error details.
                            return navigator.notification.alert(error, null, 'Content Update Error');
                        }

                        if (isUpdateAvailable) {
                            // Confirm if the user would like to update now
                            navigator.notification.confirm('Update is available, would you like to install it now?',
                                function onConfirm(buttonIndex) {
                                    if (buttonIndex == 1) {
                                        // user selected 'Update'
                                        $scope.updating = true;
                                        contentUpdater.updateContentPackageByName(contentPackageName,
                                            function callback(error, pathToContent) {
                                                if (error) {
                                                    return navigator.notification.alert(error, null, 'Error');
                                                }
                                                // else
                                                console.log('Update complete; reloading app.');
                                                window.location.reload(true);
                                            });
                                    }
                                    else {
                                        // user selected Later
                                        // no-op
                                    }
                                },
                                'Content Update',   // title
                                ['Update', 'Later'] // button labels
                            );
                        }
                        else {
                            navigator.notification.alert('App is up to date.', null, 'Content Update', 'Done');
                        }
                    }
                );
            };
        }
    ]);
