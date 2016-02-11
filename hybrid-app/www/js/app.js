// Hybrid Reference App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'hybridapp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'hybridapp.controllers' is found in controllers.js
var app = angular.module('hybridapp', ['ionic', 'hybridapp.controllers', 'uiGmapgoogle-maps', 'cqMobileApps'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

    });
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, uiGmapGoogleMapApiProvider) {

        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyDeKDZeJnZWAQlT3EQXbjMkan-LJZjnffQ',
            libraries: 'weather,geometry,visualization'
        });
    
    $ionicConfigProvider.backButton.previousTitleText(false);
    
    $stateProvider
    
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.location', {
        url: '/location',
        views: {
            'menuContent': {
                templateUrl: 'templates/location.html',
                controller: "LocationCtrl"                
            }
        }
    })

    .state('app.location.details', {
        url: '/details/:name',
        views: {
            'menuContent@app': {
                templateUrl: function ($routeParams) {
                    return "content/mobileapps/hybrid-reference-app/en/welcome/locations/" + $routeParams.name + '.template.html';
                },
                controller: "LocationDetailsCtrl"
            }
        }
    })

    .state('app.about', {
        url: '/about',
        views: {
            'menuContent': {
                templateUrl: 'content/mobileapps/hybrid-reference-app/en/welcome/about.template.html'
            }
        }
    })

    .state('app.welcome', {
        url: '/welcome',
        views: {
            'menuContent': {
                templateUrl: 'content/mobileapps/hybrid-reference-app/en/welcome.template.html'
            }
        }
    })

    .state('app.login', {
        url: '/login',
        views: {
            'menuContent': {
                templateUrl: 'templates/login.html'
            }
        }
    })

    .state('app.news', {
        url: '/news',
        views: {
            'menuContent': {
                templateUrl: 'content/mobileapps/hybrid-reference-app/en/welcome/news-and-events.template.html'
            }
        }
    })

    .state('app.news.article', {
        url: '/article/:name',
        views: {
            'menuContent@app': {
                templateUrl: function ($routeParams) {
                    return "content/mobileapps/hybrid-reference-app/en/welcome/news-and-events/" + $routeParams.name + '.template.html';
                },
            }
        }
    })

    .state('app.profile', {
        url: '/profile',
        views: {
            'menuContent': {
                templateUrl: 'templates/profile.html',
                controller: "ProfileCtrl"
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/welcome');
})