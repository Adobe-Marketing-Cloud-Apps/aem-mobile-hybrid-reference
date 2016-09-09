angular.module('hybridapp.controllers')

    .controller('LocationCtrl', ['$scope', '$http', function ($scope, $http) {

        var locationData = [];
        var sortedLocationData = [];
        var currentPosition = null;
        var closestOfficeTitle;

        $scope.showMap = true;
        $scope.origin = null;
        $scope.locations = null;

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

            currentPosition = position;

            var lat = currentPosition.coords.latitude;
            var long = currentPosition.coords.longitude;

            console.log("current position found at: " + lat + " " + long);

            if (sortedLocationData.length == 0) {
                loadLocations();
            }

        }

        function loadLocations() {
            $http.get('content/mobileapps/hybrid-reference-app/en/welcome/locations.locationdata.json')
                .then(renderLocations, locationError);
        }

        function locationError(error) {
            alert("Unable to load location data: " + error.message);
        }

        function renderLocations(response) {
            locationData = response.data;
            SortLocations(currentPosition.coords.latitude, currentPosition.coords.longitude);
            $scope.locations = sortedLocationData;
        }

        function SortLocations(latitude, longitude) {
            var mindif = 99999;
            var closest = 0;

            for (index = 0; index < locationData.length; ++index) {
                var dif = PythagorasEquirectangular(latitude, longitude, locationData[index].latitude, locationData[index].longitude);
                if (dif < mindif) {
                    closest = index;
                    mindif = dif;
                }
            }

            closestOfficeTitle = locationData[closest].title;
            locationData[closest].title = locationData[closest].title.concat(" - closest office");
            sortedLocationData[0] = locationData[closest];
            locationData.splice(closest, 1);

            $scope.origin = {
                lat: sortedLocationData[0].latitude,
                lng: sortedLocationData[0].longitude
            };

            for (index = 0; index < locationData.length; ++index) {
                sortedLocationData[index + 1] = locationData[index];
            }

        }

        function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
            lat1 = Deg2Rad(lat1);
            lat2 = Deg2Rad(lat2);
            lon1 = Deg2Rad(lon1);
            lon2 = Deg2Rad(lon2);
            var R = 6371; // km
            var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
            var y = (lat2 - lat1);
            var d = Math.sqrt(x * x + y * y) * R;
            return d;
        }

        // Convert Degrees to Radians
        function Deg2Rad(deg) {
            return deg * Math.PI / 180;
        }

        function showError(error) {
            alert("Getting the error" + error.code + "\nerror mesg :" + error.message);
        }

    }])

;