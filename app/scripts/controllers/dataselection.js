'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controller:DataselectionCtrl
 * @description
 * # DataselectionCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('DataselectionCtrl', ['$scope', '$http', function ($scope, $http) {

    $http.get('data/files.json').
	  success(function(data, status, headers, config) {
	    // this callback will be called asynchronously
	    // when the response is available
    	$scope.files = []; 
	    for(var file in data.Files) {
	    	$scope.files.push(data.Files[file].Name)
	    }
	    $scope.selectedFile = $scope.files[0];
	  }).
	  error(function(data, status, headers, config) {
	    // called asynchronously if an error occurs
	    // or server returns response with an error status.
	  });

  }]);
