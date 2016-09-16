angular.module('hybridapp.controllers')

    .controller('LocationCtrl', ['$rootScope', '$scope', '$http', '$ionicScrollDelegate', 'appConfig', function ($rootScope, $scope, $http, $ionicScrollDelegate, appConfig) {

        var locationData = [];
        var sortedLocationData = [];

        $scope.showMap = false;
        $scope.origin = null;
        $scope.locations = null;

        $scope.scrollTop = function() {
            $ionicScrollDelegate.scrollTop();
        };

        $scope.scrollBottom = function() {
            $ionicScrollDelegate.scrollBottom();
        };

        $scope.toggleMap = function(active) {
            $scope.showMap = active;
            $scope.scrollTop();
        };

        $scope.showDetails = function (location) {
            $rootScope.currentLocation = location;
            window.location.href = "#/app/location/details/" + location.detailsUrl;
        };

        getCurrentPosition();

        function getCurrentPosition() {
            if (navigator.geolocation) {
                console.log("Attempting to get current position");
                var posOptions = {maximumAge: 60000, timeout: 5000, enableHighAccuracy: true};
                navigator.geolocation.getCurrentPosition(onFoundPosition, positionError, posOptions);
            } else {
                alert("GeoLocation is not supported in this mode");
            }
        }

        function positionError(error) {
            console.log("Failed to get current position.  Error code: " + error.code + " Message: " + error.message);
            //Use GOOGLE HQ as default if failed to get current position...
            var defaultPosition = {coords: {latitude: 37.422858, longitude: -122.085065}};
            onFoundPosition(defaultPosition);
        }

        function onFoundPosition(position) {

            $scope.origin = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            console.log("current position found at: " + $scope.origin.lat + " " + $scope.origin.lng);

            if (sortedLocationData.length == 0) {
                loadLocations();
            }

        }

        function loadLocations() {
            $http.get(appConfig.basePath + '/en/welcome/locations.locationdata.json')
                .then(renderLocations, locationError);
        }

        function locationError(error) {
            alert("Unable to load location data: " + error.message);
        }

        function renderLocations(response) {
            locationData = response.data;
            sortLocations($scope.origin);
            $scope.locations = sortedLocationData;
        }

        function sortLocations(origin) {
            applyDistance(origin);
            if (angular.isArray(locationData)) {
                sortedLocationData = locationData.sort(compareDistance);
            }        }

        /** Converts numeric degrees to radians */
        if (typeof Number.prototype.toRad == 'undefined') {
            Number.prototype.toRad = function() {
                return this * Math.PI / 180;
            }
        }

        function compareDistance(a,b) {
            if (a.distance == undefined || b.distance == undefined) return 0;
            if (a.distance < b.distance)
                return -1;
            if (a.distance > b.distance)
                return 1;
            return 0;
        }

        function calculateDistance(start, end) {
            var d = 0;
            if (start && end) {
                var R = 6371;
                var lat1 = start.lat.toRad(), lon1 = start.lng.toRad();
                var lat2 = end.lat.toRad(), lon2 = end.lng.toRad();
                var dLat = lat2 - lat1;
                var dLon = lon2 - lon1;

                var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1) * Math.cos(lat2) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                d = R * c;
            }
            return d;
        }

        function applyDistance(origin) {
            if (origin.lat && origin.lng) {
                for (var i=0; i < locationData.length; i++) {
                    var loc = locationData[i];
                    loc["distance"] = calculateDistance(origin, {lat:loc.latitude,lng:loc.longitude});
                }
            }
        }

        function showError(error) {
            alert("Getting the error" + error.code + "\nerror mesg :" + error.message);
        }

    }])

    .filter('masterLocation', function() {
        return function(items) {
            var filtered = [];
            if (!items) {
                return filtered;
            }
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.master) {
                    filtered.push(item);
                }
            }
            return filtered;
        }
    })

    .filter('secondaryLocation', function() {
        return function(items) {
            var filtered = [];
            if (!items) {
                return filtered;
            }
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (!item.master) {
                    filtered.push(item);
                }
            }
            return filtered;
        }
    })

    .filter('distance', function() {
        function formatDistance(d) {
            d = d || 0;
            if (d > 1) {
                return Math.round(d) + " km";
            } else {
                d = d * 1000;
                return Math.round(d) + " m";
            }
        }
        return function(input) {
            return formatDistance(input);
        }
    })

;