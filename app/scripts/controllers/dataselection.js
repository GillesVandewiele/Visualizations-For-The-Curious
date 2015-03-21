'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controller:DataselectionCtrl
 * @description Controller of the dataVisualizationsApp. Downloads a JSON-file from the server to populate all dropdowns and validates the user input.
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('DataselectionCtrl', ['$scope', '$http', function ($scope, $http) {

  	/****** VARIABLES USED IN START SCREEN VIEW ******/
	  	
	  	$scope.files;
	  	$scope.selectedFile;
	  	
	  	$scope.columns;
	  	$scope.selectedLocationColumn;
	  	$scope.selectedValueColumn;
	  	$scope.selectedDateColumn;

	  	$scope.aggregations = ["MEAN", "SUM", "MAX", "MIN", "COUNT"];
	  	$scope.selectedAggregation = $scope.aggregations[0];

	  	$scope.grouping = ["WEEKDAY", "WEEKS", "MONTH", "YEAR"];
	  	$scope.selectedGrouping = $scope.grouping[0];

  	/*************************************************/

    $http.get('data/files.json').
	  success(function(data, status, headers, config) {  

	    // If the JSON-file was downloaded successfully, we populate all the dropdowns (files, columns) on the start screen
    	$scope.files = []; 
	    for(var file in data.Files) {
	    	$scope.files.push(data.Files[file].Name)
	    }
	    $scope.selectedFile = $scope.files[0];
	    $scope.columns = data.Files[0].Columns;
	    $scope.selectedLocationColumn=$scope.columns[0];
	    $scope.selectedValueColumn=$scope.columns[1];
	    $scope.selectedDateColumn=$scope.columns[$scope.columns.length-1];

	    // Based on the selection of dataset, we populate the other dropdowns
	    $scope.populateDropdowns = function(){
			var indexSelectedFile = $scope.files.indexOf($scope.selectedFile);
			// If the index is equal to -1, 'Add file..' was selected
			if(indexSelectedFile != -1){
				$scope.columns = data.Files[indexSelectedFile].Columns;
				$scope.selectedLocationColumn=$scope.columns[0];
			    $scope.selectedValueColumn=$scope.columns[1];
			    $scope.selectedDateColumn=$scope.columns[$scope.columns.length-1];
			} else {
				// TODO: Open a file browser so that the user can select a file to load
				$scope.columns=[];
			}
			console.log($scope.columns)
		}
	  }).
	  error(function(data, status, headers, config) {
	    // TODO: show an error message on the homepage
	  });
  }]);
