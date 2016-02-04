app.controller('LocationCtrl', function($scope, $http, $timeout, uiGmapGoogleMapApi) {

    var locationData = [];
    var sortedLocationData = [];
    var currentPosition = null;
    var closestOfficeTitle;
    var map;
    var currentLocationMarker = null;

    uiGmapGoogleMapApi.then(function(maps) {
        console.log("google map ready");
        initMap();
        getCurrentPosition();
    });

    function initMap() {
        var mapOptions = {
            zoom   : 15,
            disableDefaultUI: true,
            streetViewControl: true
        };

        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

        // Create the DIV to hold the geolocation map control and call the constructor passing in this DIV
        var geolocationDiv = document.createElement('div');
        var geolocationControl = new GeolocationControl(geolocationDiv, map);

        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(geolocationDiv);
    }

    function getCurrentPosition() {
        if (navigator.geolocation) {
            console.log("Attempting to get current position");
            var posOptions = {maximumAge:60000, timeout:5000, enableHighAccuracy:true};
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

        currentPosition = position;

        var lat = currentPosition.coords.latitude;
        var long = currentPosition.coords.longitude;
        var latLng = new google.maps.LatLng(lat, long);

        console.log("current position found at: " + lat + " " + long);

        if (currentLocationMarker != null) {
            currentLocationMarker.setMap(null);
        }

        currentLocationMarker = new google.maps.Marker({
            position: latLng,
            icon: 'img/currentlocation.png',
            animation: google.maps.Animation.DROP,
            map: map
        });

        map.setZoom(15);
        map.panTo(latLng);

        if (sortedLocationData.length == 0) {
            loadLocations();
        }

    }

    //Google Maps js API v3 doesn't have a geolocation control.  We must create one...
    function GeolocationControl(controlDiv, map) {
        // Set CSS for the control button
        var controlUI = document.createElement('div');
        controlUI.style.paddingRight = "0.5rem";
        controlUI.style.paddingTop = "0.5rem";
        controlUI.id = "geolocationcontrol";
        var controlIcon = document.createElement("img");
        controlIcon.src = "img/geolocationicon.png";
        controlUI.appendChild(controlIcon);
        controlDiv.appendChild(controlUI);
        // Setup the click event listeners to geolocate user
        google.maps.event.addDomListener(controlUI, 'click', getCurrentPosition);
    }

    $scope.moveMapTo = function(location) {
        console.log("attempting to move map to: " + location.latitude + " " + location.longitude);
        map.panTo(new google.maps.LatLng(location.latitude, location.longitude));
        map.setZoom(15);
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
        addAdobeLocationMarkers(locationData);
        SortLocations(currentPosition.coords.latitude,currentPosition.coords.longitude);
        $scope.locationlist = sortedLocationData;
    }

    function addAdobeLocationMarkers(locations) {
        for (index = 0; index < locationData.length; ++index) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(locationData[index].latitude, locationData[index].longitude),
                map: map,
                title: locationData[index].title
            });
        }
    }


    function SortLocations( latitude, longitude )
    {
        var mindif=99999;
        var closest = 0;

        for (index = 0; index < locationData.length; ++index) {
            var dif =  PythagorasEquirectangular(latitude, longitude, locationData[index].latitude, locationData[index].longitude);
            if ( dif < mindif )
            {
                closest=index;
                mindif = dif;
            }
        }

        closestOfficeTitle = locationData[closest].title;
        locationData[closest].title = locationData[closest].title.concat(" - closest office");
        sortedLocationData[0] = locationData[closest];
        locationData.splice(closest, 1);

        for (index=0; index < locationData.length; ++index) {
            sortedLocationData[index+1] = locationData[index];
        }

    }

    function PythagorasEquirectangular( lat1, lon1, lat2, lon2 )
    {
        lat1 = Deg2Rad(lat1);
        lat2 = Deg2Rad(lat2);
        lon1 = Deg2Rad(lon1);
        lon2 = Deg2Rad(lon2);
        var R = 6371; // km
        var x = (lon2-lon1) * Math.cos((lat1+lat2)/2);
        var y = (lat2-lat1);
        var d = Math.sqrt(x*x + y*y) * R;
        return d;
    }

    // Convert Degress to Radians
    function Deg2Rad( deg ) {
        return deg * Math.PI / 180;
    }

    function showError(error){
        alert("Getting the error"+error.code + "\nerror mesg :" +error.message);
    }

});