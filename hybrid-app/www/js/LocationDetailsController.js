app.controller('LocationDetailsCtrl', function($scope, $window) {

    $scope.phone = function(event, number) {
        window.open("tel:" + number.replace(/ /g,''), '_system');
        event.preventDefault();        
    }
    
    $scope.showMap = function(event, address) {
        var href = "http://maps.google.com/?q=";

        if (device.platform == "iOS") {
            href = "http://maps.apple.com/?q=";
        } else if (device.platform == "Android") {
            href = "geo:0,0?q=";
        }

        href = href + address;

        $window.open( encodeURI( href ), '_system');        
    }
    
    $scope.shareMapLink = function(event, latitude, longitude) {
        var mapBaseUrl = "http://maps.google.com/?q="
        var fullMapLink = mapBaseUrl + latitude + "," + longitude;
        console.log("Attempting to share a map link: " + fullMapLink);
        if (window.plugins && window.plugins.socialsharing) {
            window.plugins.socialsharing.share(fullMapLink);
        }
    }

});