'use strict';

angular.module('pingme', ['ngAnimate', 'ngStorage','ngRoute', 'chart.js','ngToast','ui.bootstrap' ])

.config(['$routeProvider', '$httpProvider','$locationProvider','ngToastProvider',
     function ($routeProvider, $httpProvider, $locationProvider, ngToastProvider  ) {
    
    ngToastProvider.configure({
        animation: 'slide' // or 'fade'
    });
    $routeProvider.
        when('/', {templateUrl: 'partials/home.html',controller: 'HomeCtrl'}).
        when('/signin', {templateUrl: 'partials/signin.html',controller: 'HomeCtrl'}).
        when('/signup', {templateUrl: 'partials/signup.html',controller: 'HomeCtrl'}).
        when('/me', {templateUrl: 'partials/me.html',controller: 'HomeCtrl'}).
        when('/user', {templateUrl: 'partials/me.html',controller: 'HomeCtrl'}).
        when('/show', {templateUrl: 'partials/show.html',controller: 'HomeCtrl'}).
        when('/tag', {templateUrl: 'partials/tag.html',controller: 'HomeCtrl'}).
        otherwise('/');

    $locationProvider.html5Mode(true);


    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        config.headers.Authorization = 'Bearer ' + $localStorage.token;
                    }
                    return config;
                }
                // 'responseError': function(response) {
                //     if(response.status === 401 || response.status === 403) {
                //         $location.path('/signin');
                //     }
                //     return $q.reject(response);
                // }
            };
        }]);

    }//end of function`
    
]);//end of config 