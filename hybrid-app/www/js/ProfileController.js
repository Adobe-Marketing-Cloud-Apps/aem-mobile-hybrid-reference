angular.module('hybridapp.controllers')

    .controller('ProfileCtrl', ['$scope', '$rootScope', '$http', 'appManifest', 'AEMcsrfToken', '$jrCrop', function ($scope, $rootScope, $http, appManifest, AEMcsrfToken, $jrCrop) {
        
        // Form data for the user profile
        $scope.profileData = {};
        $scope.successMessage = null;
        $scope.errorMessage = null;

        var imgURI = null;
        var manifestData = null;
        var csrfToken = "";
        var createPath = '/content/mobileapps/hybrid-reference-app.ionicapp.create.html';
        var updatePath = '/content/mobileapps/hybrid-reference-app.ionicapp.profile.html';
        var aemPostCsrfParam = ':cq_csrf_token';

        // Get the AEM publish server URL
        appManifest.getData(function (error, data) {
            manifestData = data;

            var server = manifestData.serverURL;
            if (server.charAt(server.length - 1) === '/') {
                server = server.substr(0, server.length - 1);
                manifestData.serverURL = server;
            }
        });

        init();

        $scope.$watch('currentProfile', init);

        // Prompt the user to add avatar from Camera or Camera Roll on device.
        $scope.captureProfileImage = function () {
            navigator.notification.confirm(
                'Please select a source for your new avatar.',
                function (select) {
                    switch (select) {
                        case 1:
                            imageFromCamera();
                            break;
                        case 2:
                            imageFromRoll();
                            break;
                        default:
                        // NOOP
                    }
                },
                'Avatar Source',
                ['Camera', 'Camera Roll', 'Cancel']
            );
        };

        // Update user profile data on the AEM Publish Server when the user submits the form.
        $scope.doUpdateProfile = function () {
            var submitPath = null;
            var password = null;

            if ($scope.currentProfile) {
                submitPath = manifestData.server + updatePath;
            } else {
                submitPath = manifestData.server + createPath;
            }

            // check whether the passwords do match
            if ($scope.profileData.password && $scope.profileData.confirm
                && $scope.profileData.password !== $scope.profileData.confirm) {
                $scope.errorMessage = "Passwords don't match.";
                return;
            } else {
                password = $scope.profileData.password;
            }

            //check whether there is a new avatar image to upload
            if (imgURI) {
                // prepare to upload new avatar with form data
                var fileTrans = new FileTransfer();

                var params = {
                    givenName: $scope.profileData.firstName,
                    familyName: $scope.profileData.lastName,
                    email: $scope.profileData.email
                };

                if ($scope.currentProfile) {
                    params.profilePath = $scope.currentProfile.path
                }

                if (password) {
                    params.password = password;
                } else if (!password && !$scope.currentProfile) {
                    $scope.errorMessage = "Password can't be empty.";
                    return;
                }

                params[aemPostCsrfParam] = csrfToken;

                var options = {
                    fileKey: "avatar",
                    params: params
                };

                saveProfile();

                fileTrans.upload(imgURI, encodeURI(submitPath), onSuccessPost, onFailedPost, options);
            } else {
                // Just the form data to submit
                var formData = new FormData();

                formData.append('givenName', $scope.profileData.firstName);
                formData.append('familyName', $scope.profileData.lastName);
                formData.append('email', $scope.profileData.email);

                saveProfile();

                if ($scope.currentProfile) {
                    formData.append('profilePath', $scope.currentProfile.path);
                }

                if (password) {
                    formData.append('password', password);
                } else if (!password && !$scope.currentProfile) {
                    $scope.errorMessage = "Password can't be empty.";
                    return;
                }

                formData.append(aemPostCsrfParam, csrfToken);

                $http.post(submitPath, formData, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).then(onSuccessPost, onFailedPost);
            }
        };

        function init() {
            // Where the user is already authenticated, populate the form.

            loadProfile();

            if ($rootScope.currentProfile) {
                $scope.profileData.firstName = $rootScope.currentProfile['givenName'];
                $scope.profileData.lastName = $rootScope.currentProfile['familyName'];
                $scope.profileData.email = $rootScope.currentProfile['email'];
            } else {
                $scope.profileData = {};
            }

            $scope.successMessage = null;
            $scope.errorMessage = null;

            // fetch a new CSRF token
            AEMcsrfToken.getToken(manifestData.server, function (data) {
                csrfToken = data;
            });
        }

        function imageFromCamera() {
            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 50,
                targetWidth: 350,
                targetHeight: 350,
                sourceType: Camera.PictureSourceType.CAMERA,
                cameraDirection: Camera.Direction.FRONT,
                destinationType: Camera.DestinationType.FILE_URI
            });
        }

        function imageFromRoll() {
            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 50,
                targetWidth: 400,
                targetHeight: 400,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                destinationType: Camera.DestinationType.FILE_URI
            });
        }

        function imageCrop() {
            $jrCrop.crop({
                url: imgURI,
                width: 350,
                height: 350,
                circle: true,
                title: 'Move and Scale'
            }).then(function(canvas) {
                // success!
                $rootScope.profileImage = canvas.toDataURL();
                $scope.$apply();
            }, function() {
                // User canceled or couldn't load image.
            });
        }

        function saveProfile() {
            window.localStorage.setItem("firstName", $scope.profileData.firstName);
            window.localStorage.setItem("lastName", $scope.profileData.lastName);
            window.localStorage.setItem("email", $scope.profileData.email);
            window.localStorage.setItem("password", $scope.profileData.password);
        }

        function loadProfile() {
            $scope.profileData.firstName = window.localStorage.getItem("firstName");
        }

        // Load the appropriate image, either the default placeholder or the users avatar.
        $scope.getImage = function() {
            if ($rootScope.profileImage) {
                return $rootScope.profileImage;
            } else {
                return 'img/profile.png';
            };
        }

        $scope.logout = function () {
            $scope.isLoggedIn = false;
            $rootScope.profileImage = null;
            $rootScope.currentProfile = null;
            $scope.loginData = {};
            TargetService.setData(null);
            
            $state.go('/app/welcome');
        }

        function onSuccess(imageURI) {
            imgURI = imageURI;
            imageCrop();
        }

        function onFail(message) {
            navigator.notification.alert(message, null, 'Oops!');
        }

        function onSuccessPost(response) {
            $scope.successMessage = "Profile saved.";
            if ($scope.errorMessage) {
                $scope.errorMessage = null;
            }
            // For the case of no active session reset the form
            if (!$scope.currentProfile) {
                $rootScope.profileImage = null;
                imgURI = null;
                $scope.profileData = {};
                
                // force redraw
                $scope.$apply();
            }
        }

        function onFailedPost(response) {
            switch (response.status) {
                case 403:
                    $scope.errorMessage = "Could not save your profile. Please check your permissions.";
                    break;
                case 500:
                default:
                    $scope.errorMessage = "And error has occurred with the service and your profile could not be saved.";
            }

            // force redraw
            $scope.$apply();
        }
    }])
;
