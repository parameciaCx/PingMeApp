'use strict';  //use strict mode (no undeclared variables)

/* Control Code 
Didn't end up separating into 3 different controls because I combined management and account into one(HomeCtrl)
Ended up making CSR and Management a type of user, users are identified with special ID (1-3) (1 is regular user 3 is superadmin(management))
Easier to make changes to my code this way */

angular.module('pingme')
    .controller('HomeCtrl', ['$rootScope', '$scope', '$location', '$localStorage', '$timeout','$modal','Main','ngToast',
                    function($rootScope, $scope, $location, $localStorage,$timeout,$modal, Main,ngToast,$window) {
		//Account Control
        //setUser method for Editing the user details
        $scope.setUser = function(){
            Main.setUser({setUser:$scope.myDetails.data},function(response){
                console.log(response)
                if(response.type) {
                    ngToast.create({className: 'success',content:'profile updated successfully '});
                    $scope.myDetails.data = response.data
                }
				else{
					ngToast.create({className: 'warning',content:'User already exists!'});
				}
            },function(error){
                console.log(error);
                ngToast.create({className: 'warning',content:"Unexpected Error Occured"});
            });
            
        }
		//Data Control
        //tagAction method for Suggesting/Approving the tags
        $scope.tagAction = function(tagName) {
            var Tag = {"tagName":tagName};
            $scope.remove($scope.tags,tagName);
            Main.suggestTag(Tag,function(response){
                ngToast.create({className: 'warning',content:response.data});
            },function(error){
                ngToast.create({className: 'warning',content:"Unexpected Error Occured"});
            })
        }
		//Data Control
        $scope.remove = function remove(arr, what) {
            arr.forEach(function(element) {
                var i = 0;
                if(element.tagName == what) {
                    arr.splice(i,1);
                    ++i;
                }
            }, this);
            var found = arr.indexOf(what);
            while (found !== -1) {
                arr.splice(found, 1);
                found = arr.indexOf(what);
            }
        }
		//Data Control
        $scope.deleteTag =function(tagName) {
            var Tag = {"tagName":tagName};
            $scope.remove($scope.tags,tagName);
            Main.denyTag(Tag,function(response){
                ngToast.create({className: 'warning',content:response.data});
            },function(error){
                ngToast.create({className: 'warning',content:"Unexpected Error Occured"});
            })
            
        }
		//Data Control
        //get tag details 
        $scope.getTags = function() {
            if($localStorage.token) {
                // console.log($scope.tags);
                $scope.RunningserviceCall = true;$scope.count = 1;
                if($scope.tags == undefined && $scope.count < 2) {                   
                    Main.getTags(function(success){
                        $scope.count++;
                        if(success.type ) {
                            // console.log(success.data);
                            $scope.tags = success.data;
                            if(!$scope.isAdmin && $scope.tags && $scope.RunningserviceCall) {
                                $scope.RunningserviceCall = false;
                                $scope.startRandomizer();
                            }

                        } else {
                            ngToast.create({className: 'warning',content:"Some failure occured please try after some time"});
                        }
                    },function(error){
                        console.log(error)
                    })
                    return $scope.tags;; 
                } else {
                    // console.log($scope.tags);
                    return $scope.tags;
                }
            }
        }
		//Data Control
        //save tagName when user select tag from the popup
        $scope.tagClick = function(tagName) {
             console.log("Tag clicked"+tagName);
            Main.settag({tagName:tagName}, function(res) {
                console.log(res);
                if(res.type) {
                    ngToast.create({className: 'success',content:res.data});
                }else {
                    ngToast.create({className: 'success',content:res.data});                    
                }
            }, function() {
                console.log("set Tag error occured");
                ngToast.create({className: 'success',content:"Error occured while submitting Tag"});
            })

        }
		//Data Control
        //getUserVisualization method for getting the visualization data
        $scope.getUserVisualization = function() {
            console.log("get visualization called");
            $scope.fetchAdmin(function(isAdmin){
                console.log("inside callback isAdmin"+isAdmin);
            if(isAdmin) {
                Main.getVisual(function(res){
                    $scope.adminVisualization = res;
                    console.log(res);
                    console.log(res);
                    $scope.tagsNameArray = [];$scope.tagsDataArray = [];
                for(var i=0;i<res.length;i++) {
                    $scope.tagsNameArray.push(res[i]['tagName']);
                    $scope.tagsDataArray.push(res[i]['count']);
                }
                if(i == res.length) {
                    // $scope.tagsNameArray = tagsNameArray;
                    // $scope.tagsDataArray = tagsDataArray;
                    console.log($scope.tagsNameArray);
                    console.log($scope.tagsDataArray);               
                }

                },function(error){
                    console.log("Admin visual error response");
                    console.log(error);
                })
            } else {
                Main.getUserTag(function(res) {
                    console.log(res);
                    $scope.tagsNameArray = [];$scope.tagsDataArray = [];
                for(var i=0;i<res.length;i++) {
                    $scope.tagsNameArray.push(res[i]['tagName']);
                    $scope.tagsDataArray.push(res[i]['count']);
                }
                if(i == res.length) {
                    console.log($scope.tagsNameArray);
                    console.log($scope.tagsDataArray);                   
                }
                }, function() {
                    console.log("failed to fetch details")
                })
            }
        });

        }
		//Account Control
        //signin method
        $scope.signin = function() {
            var formData = {email: $scope.email,password: $scope.password}

            Main.signin(formData, function(res) {
                console.log("signIn response");
                console.log(res);
                if(!res.type) {
                     ngToast.create({className: 'warning',content:res.data});
                } else {
                    $localStorage.token = res.token;
                    $scope.admin = res.access;
                    console.log("Admin "+$scope.admin);
                    $location.path('/');
                    $scope.checkAdmin()
                }
            }, function(error) {
                console.log("failed to signin")
                console.log(error)
                $rootScope.error = 'Failed to signin';
            })
        };
		//Account Control
        //signup method
        $scope.signup = function() {
            console.log("signup method called");
            var formData = {
                name:$scope.name,
                email: $scope.email,
                username:$scope.username,
                password: $scope.password,
            }
            console.log(formData);
            Main.save(formData, function(res) {
                console.log("signUp response below");
                console.log(res);
                if(!res.type) {
                     ngToast.create({
                         className: 'warning',
                         content:res.data});
                } else {
					ngToast.create({className: 'success',content:'Account successfully created!'});
                    $localStorage.token = res.token;
                    $scope.admin = res.access;
                    console.log("Admin "+$scope.admin);
                    $location.path('/');
                    $scope.checkAdmin();
                }
                // $scope.startRandomizer()
            }, function(error) {
                console.log("failed to signup");
                console.log(error);
                $rootScope.error = 'Failed to signup';
            })
        };
		//Account Control
        //me method for fetching the user detail
        $scope.me = function() {
            console.log("controller method me is called");
            Main.me(function(res) {
                $scope.myDetails = res;
            }, function() {
                $rootScope.error = 'Failed to fetch details';
            })
            $scope.checkAdmin()
        };
		//Account Control
        //logout method for logging user out
        $scope.logout = function() {
            console.log("controller logout method called")
            Main.logout(function() {
                $location.path('/');
                $scope.isLoggedIn = false;
            }, function() {
                $rootScope.error = 'Failed to logout';
            });
        };
		//Account Control
        //isLogged method check wether user is logged in or not
        $scope.isLogged = function() {
            var token = $localStorage.token;
            if(token) {
                return true;
            } else {
                return false;                    
            }
        }
		//Account Control
        // checkAdmin method for checking wether user is admin or not
        $scope.checkAdmin = function( ) {
            // console.log("check admin called")
            if($localStorage.token) {
                Main.checkAdmin(function(res){
                    $scope.isAdmin = res;
                    console.log($scope.isAdmin);
                },function(err){
                    console.log("error occured")
                    console.log(err);
                });
            } else {
                $scope.isAdmin = false;
                return false;
            }
        }
		//Account Control
        $scope.checkAdmin();
        //fetchAdmin method callback based method for sync result
        $scope.fetchAdmin = function(callback ) {
            // console.log("check admin called")
            if($localStorage.token) {
                Main.checkAdmin(function(res){
                    $scope.isAdmin = res;
                    callback($scope.isAdmin);
                    // console.log($scope.isAdmin);
                },function(err){
                    console.log("error occured")
                    console.log(err);
                });
            } else {
                $scope.isAdmin = false;
                return false;
            }
        }
		//Data control
        //startRandomizer method for starting the randomize process for popup
         $scope.startRandomizer = function(){
            //  console.log("randomize method called")
             $scope.fetchAdmin(function(isAdmin) {
                if($localStorage.token && !isAdmin) {
                    //set time interval, set 6000 for easy testing
                    $timeout(timeoutMethod, 6000); 
                }
             })
        }
		//Data Control
        // timeoutMethod method for randomization process
         var timeoutMethod=  function(){
            // console.log("Random method called")
            $scope.toggleModal('Success',true)
            $scope.startRandomizer();
        }
		//Data Control
        //method for invoking the modal
        $scope.toggleModal = function(btnClicked,bool){
            // console.log("toggleModal Called")
            $scope.buttonClicked = btnClicked;
            $scope.showModal = !$scope.showModal;
        };        

            $scope.getTags()      
         
    }])
    
//directive code for the popup 
.directive('modal', function () {
    return {
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                '<h4 class="modal-title">Please Select the Tag</h4>' + 
              '</div>' + 
              '<div class="modal-body" ng-transclude></div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
      restrict: 'E',
      transclude: true,
      replace:true,
      scope:true,
      link: function postLink(scope, element, attrs) {
          scope.$watch(attrs.visible, function(value){
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

        $(element).on('shown.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = true;
          });
        });

        $(element).on('hidden.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = false;
          });
        });
      }
    };
  });