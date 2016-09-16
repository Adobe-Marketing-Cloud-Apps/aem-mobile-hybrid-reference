angular.module('hybridapp.controllers')

    .controller('LocationDetailsCtrl', ['$rootScope', '$scope', '$window', function ($rootScope, $scope, $window) {

        $scope.phone = function (event, number) {
            $window.open("tel:" + number.replace(/ /g, ''), '_system');
            event.preventDefault();
        };

        $scope.showMap = function (event, address) {
            var href = "http://maps.google.com/?q=";

            if (device.platform == "iOS") {
                href = "http://maps.apple.com/?q=";
            } else if (device.platform == "Android") {
                href = "geo:0,0?q=";
            }

            href = href + address.replace(/(\r\n|\n|\r)/gm,"");

            $window.open(encodeURI(href), '_system');
        };

        $scope.directions = function(e) {
            var dest = $rootScope.currentLocation;
            var dcoords = dest.latitude + "," + dest.longitude;

            // Open the device's map application with the current location as the destination
            var url;
            if (device.platform == "iOS") {
                url = "maps:daddr=" + dcoords;
            } else if (device.platform == "Android") {
                url = "geo:" + dcoords;
            }
            if (url) {
                $window.open(url , '_system');
            } else {
                console.log("Unable to open native maps app");
            }
            e.preventDefault();
            e.stopPropagation();
        };

        $scope.shareMapLink = function (event, latitude, longitude) {
            var mapBaseUrl = "http://maps.google.com/?q=";
            var fullMapLink = mapBaseUrl + latitude + "," + longitude;
            console.log("Attempting to share a map link: " + fullMapLink);
            if (window.plugins && window.plugins.socialsharing) {
                window.plugins.socialsharing.share(fullMapLink);
            }
        }

    }])
;