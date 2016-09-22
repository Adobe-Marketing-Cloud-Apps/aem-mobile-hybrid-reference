angular.module('hybridapp.controllers', [])

.controller('AppCtrl', ['$scope', '$rootScope', '$ionicModal', '$timeout', 'appManifest', 'appState', '$rootElement', 'TargetService', '$q',
    function ($scope, $rootScope, $ionicModal, $timeout, appManifest, appState, $rootElement, TargetService, $q, UserService) {

            // Form data for the login modal
            $rootScope.isLoggedIn = false;
            $scope.loginData = {};

            // Initialize authorization code
            var manifestData;
            var auth;

            // Get the AEM Server details.
            appManifest.getData(function (error, data) {
                manifestData = data;

                var server = manifestData['serverURL'];
                if (typeof server !== 'undefined' && server.charAt(server.length - 1) === '/') {
                    server = server.substr(0, server.length - 1);
                }

                manifestData.server = server;

            });

            $scope.getCurrentProfile = function () {
                if (!$rootScope.currentProfile) {
                    $rootScope.currentProfile = {};
                } return $rootScope.currentProfile;
            }

            // *****************************
            // Initialize the contentUpdater
            // *****************************

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

            // Slide open the login modal window
            $scope.showLogin = function () {
                $scope.modal.show();
            };

            // Slide closed the login modal window.
            $scope.closeLogin = function () {
                $scope.modal.hide();
            };

            // ***************************************************************
            // User Authentication methods
            // You'll need to decide on how your users should be authenticated
            // and update both the Login.html page and these scripts.
            // ***************************************************************

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

                        $rootScope.isLoggedIn = true;
                        
                        // populate user profile
                        profileProvider.fetch(function (error, profile) {
                            if (!error && profile) {
                                $rootScope.currentProfile.image = manifestData.server + profile.path + '/photos/primary/image';
                                $rootScope.currentProfile.username = $scope.loginData.username;

                                //TODO: tease out profile attributes.
                                $rootScope.currentProfile.profile = profile;
                                TargetService.setData(profile);
                            }
                        });

                        $scope.closeLogin();
                    }
                });
            };

            // **********************
            // Handle oAuth2 with AEM
            // **********************
            $scope.doOAuthLogin = function () {

                console.log("AEM oAuth2 login function start");
                $scope.errorMessage = null;

                // Load the AEM oAuth2 configuration settings as defined in the AEM Mobile Dashboard.
                // Note: fetchJSON method is located in the mobileapps.js file.
                cq.mobileapps.util.file.fetchJSON("MobileAppsConfig.json", function (error, data) {
                    if (data && data.oauth) {
                        auth = new cq.mobileapps.auth.OAuth({
                            'server': manifestData.server,
                            'client_id': data.oauth.clientId,
                            'client_secret': data.oauth.clientSecret,
                            'redirect_uri': data.oauth.redirectURI
                        });

                        // Pass the auth configuration into the AEM Mobile SDK to get the appropriate provider.
                        auth.authorize(function (error) {
                            var profileProvider = cq.mobileapps.provider.ProfileRegistry.getProvider(auth);

                            if (error) {
                                console.log("AEM authentication error " + error);
                            } else {
                                $scope.isLoggedIn = true;
                                appState.setAuth(auth);
                                
                                // populate profile
                                profileProvider.fetch(function (error, profile) {
                                    if (!error && profile) {
                                        $rootScope.currentProfile.image = manifestData.server + profile.path + '/photos/primary/image';
                                        
                                        //TODO: tease out profile attributes.
                                        $rootScope.currentProfile.profile = profile;
                                        TargetService.setData(profile);
                                    }
                                });

                                $scope.closeLogin();
                            }
                        });
                    }
                }, "oauth");
            };

            // ************************************
            // Handle oAuth2 - Login with facebook
            // ************************************
            $scope.facebookLogin = function() {

                console.log("facebookLogin function start");
                facebookConnectPlugin.getLoginStatus(function(success) {

                    if(success.status === 'connected') {
                        // The user has already authenticated with Facebook.
                        console.log('getLoginStatus', success.status);

                        // Get the user information from Facebook and update the user.
                        getFacebookProfileInfo(success.authResponse).then(function(profileInfo) {

                            $scope.getCurrentProfile();
                            
                            //Set user profile information  
                            $rootScope.currentProfile.auth = success.authResponse;
                            $rootScope.currentProfile.image = "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large";
                            $rootScope.currentProfile.name = profileInfo.name;
                            $rootScope.currentProfile.email = profileInfo.email;
                            $rootScope.currentProfile.id = profileInfo.id;

                            $rootScope.isLoggedIn = true;
                            $scope.closeLogin();

                        }, function(fail) {
                            console.log('Unable to get profile information from Facebook', fail);
                        });

                    } else {

                        // The user may be logged into Facebook; but not allowed the app access.
                        console.log('getLoginStatus', success.status);

                        // Get email and public profile information from Facebook.
                        // @see https://developers.facebook.com/docs/facebook-login/permissions/v2.4
                        // Invoke fbLoginSuccess or fbLoginError based on the response from Facebook
                        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);

                    } // end success.status connected if/else statement

                }); // end facebookConnectPlugin.getLoginStatus

            }; // end facebookSignIn function


            // This is the success callback from the Facebook login method.
            // Once the user is successfully authenticated, this method is executed.
            var fbLoginSuccess = function(response) {

                console.log('facebook login success');
                if (!response.authResponse) {
                    fbLoginError("Cannot find the authResponse in the response.");
                    return;
                } else {
                    $scope.getCurrentProfile();
                    $rootScope.currentProfile.auth = response.authResponse;
                    $rootScope.currentProfile.token = response.authResponse.accessToken;
                    $rootScope.currentProfile.expires = response.authResponse.expiresIn; //e.g. "5123142"
                    $rootScope.currentProfile.id = response.authResponse.userID;
                }

                getFacebookProfileInfo(response.authResponse).then(function(profileInfo) {
 
                    $scope.getCurrentProfile();

                    //Set user profile information  
                    $rootScope.currentProfile.auth = response.authResponse;
                    $rootScope.currentProfile.image = "http://graph.facebook.com/" + response.authResponse.userID + "/picture?type=large";
                    $rootScope.currentProfile.name = profileInfo.name;
                    $rootScope.currentProfile.email = profileInfo.email;
                    $rootScope.currentProfile.id = profileInfo.id;

                    $rootScope.isLoggedIn = true;
                    $scope.closeLogin();

                }, function(fail) {
                    // Fail get profile info
                    console.log('profile info fail', fail);
                });
            };

            // This is the fail callback from the login method
            var fbLoginError = function(error) {
                console.log('fbLoginError', error);
            };

            // This method is to get the user profile info from the facebook api.
            var getFacebookProfileInfo = function (authResponse) {
                var info = $q.defer();

                facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
                    function (response) {
                        console.log(response);
                        info.resolve(response);
                    },
                    function (response) {
                        console.log(response);
                        info.reject(response);
                    }
                    );
                return info.promise;
            };

            //  Logout Facebook authenticated user.
            $scope.facebookLogout = function() {

                facebookConnectPlugin.logout(function() {
                    logout();
                    $state.go('/app/welcome');
                });

            }

            // User authentication logout
            $scope.logout = function () {
                auth.logout(function (error) {
                    if (error) {
                        console.log("Logout error", error);
                    }
                    else {
                        $rootScope.isLoggedIn = false;
                        $rootScope.currentProfile.auth = null;
                        $rootScope.currentProfile.image = manifestData.server + profile.path + 'img/profile.png';
                        $rootScope.currentProfile.name = null;
                        $rootScope.currentProfile.email = null;
                        $rootScope.currentProfile.id = null;
                        $rootScope.currentProfile = null;
                        $scope.loginData = {};
                        TargetService.setData(null);
                    }
                });
            }

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
        ])

        .controller('MenuCtrl', ['$scope', '$ionicSideMenuDelegate', function($scope, $ionicSideMenuDelegate) {
            $scope.menuStyle = {};
            $scope.$watch(function(){
               return $ionicSideMenuDelegate.getOpenRatio();
            }, function(newValue, oldValue) {
                if (newValue == 0){
                    $scope.hideLeft = true;
                } else{
                    $scope.hideLeft = false;
                }
                $scope.menuStyle.opacity = newValue;
            });
        }])
;
