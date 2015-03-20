'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controller:DataselectionCtrl
 * @description
 * # DataselectionCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('DataselectionCtrl', function ($scope) {
    $scope.gerard = 'zalig';
    
    $scope.url = "/data/files.json";
    $scope.newFile = "";
    $scope.files = []; 
    console.log('received: ', $http.get($scope.url));
    $scope.add = function(){
    	$http.get($scope.url).then(function(response){
    		$scope.newFile = response.data;//.queries.request.totalResults;
            $scope.files.push($scope.newFile);
    	});
    };
  });
