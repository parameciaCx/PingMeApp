'use strict';

angular.module('pingme')
    .factory('Main', ['$http', '$localStorage', function($http, $localStorage){
        var baseUrl = "http://localhost:3000";
        function changeUser(user) {
            angular.extend(currentUser, user);
        }
		//Decodes the token
        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }
		//Gets user from the given encoded user token
        function getUserFromToken() {
            console.log("getUserFromToken Method below is token value");
            var token = $localStorage.token;
            console.log(token);
            var user = {};
            if (typeof token !== 'undefined') {
                var encoded = token.split('.')[1];
				//call decode method 
                user = JSON.parse(urlBase64Decode(encoded));
            }
            return user;
        }

        var currentUser = getUserFromToken();
		
		// exposes methods to controller.js
        return {
            save: function(data, success, error) {
                $http.post(baseUrl + '/signin', data).success(success).error(error)
            },
            signin: function(data, success, error) {
                $http.post(baseUrl + '/authenticate', data).success(success).error(error)
            },
            me: function(success, error) {
                $http.get(baseUrl + '/getme').success(success).error(error)
            },
            logout: function(success) {
                changeUser({});
                delete $localStorage.token;
                success();
            },
            isLoggedInMain: function(callback) {
                console.log("check isLoggedIn service method called")
                var token = $localStorage.token;
                if(token) {
                    callback(true);
                } else {
                    callback(false);                    
                }
            },
            settag: function(data,success,error) {
                $http.post(baseUrl + '/settag',data).success(success).error(error);
            },
            getUserTag: function(success,error) {
                $http.get(baseUrl + '/getusertag').success(success).error(error);
            },
            getTags: function(success,error) {
                $http.get(baseUrl + '/gettag').success(success).error(error);
            },
            checkAdmin: function(success,error) {
                // console.log("service checkAdmin");
                $http.get(baseUrl + '/isadmin').success(success).error(error);
            },
            getVisual:function(success,error) {
                $http.get(baseUrl+'/getvisual').success(success).error(error);
            },
            suggestTag:function(data,success,error) {
                $http.post(baseUrl + '/savetag',data).success(success).error(error);
            },
            setUser:function(data,success,error) {
                $http.post(baseUrl+'/setuser',data).success(success).error(error);
            },
            denyTag:function(data,success,error) {
                $http.post(baseUrl+'/denytag',data).success(success).error(error);
            }
        };
    }
]);
