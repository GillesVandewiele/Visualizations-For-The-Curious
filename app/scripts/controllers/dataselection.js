'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controller:DataselectionCtrl
 * @description Controller of the dataVisualizationsApp. Downloads a JSON-file from the server to populate all dropdowns and validates the user input.
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('DataselectionCtrl', ['$scope', '$http', function ($scope, $http) {

  	/****************** CONSTANTS ********************/

  		var MAX_DATASETS = 3;

  	/*************************************************/

  	/****** VARIABLES USED IN START SCREEN VIEW ******/

  		$scope.fileData = null; // The data stored in files.json on the server

	  	$scope.aggregations = ["MEAN", "SUM", "MAX", "MIN", "COUNT"];
	  	$scope.grouping = ["WEEKDAY", "WEEKS", "MONTH", "YEAR"];

	  	$scope.files; // Extra array for faster lookup in the datasets based on name
	  	$scope.selectedFile;

	  	$scope.datasets; // All datasets that were retrieved from the server
	  	$scope.userDatasets = []; // The defined datasets by the user
	  	$scope.currentDataset;

  	/*************************************************/

  	/************* PRIVATE FUNCTIONS *****************/

  	// Private function to create a dataset (which has a lot of properties)
  	var updateDataset = function(data, index){
  		return {name:data[index].Name, columns:data[index].Columns, location:data[index].Columns[0],
			value:data[index].Columns[1], date:data[index].Columns[data[index].Columns.length-1],
			path: data[index].Path, aggregation:$scope.aggregations[0], grouping:$scope.grouping[0]};
  	};

  	// Private function to check if two specified datasets are not unique
  	var datasetTracker = function(dataset){
  		return dataset.name + dataset.location + dataset.value + dataset.date + dataset.aggregation + dataset.grouping;
  	};

  	// Check if dataset is in userDatasets using datasetTracker
	var containsDataset = function(dataset, userDatasets){
		for(var i = 0; i < userDatasets.length; i++){
			if(datasetTracker(userDatasets[i]) == datasetTracker(dataset)){
				return i;
			}
		}
		return -1;
	}

  	/************************************************/

    $http.get('data/files.json').
	  success(function(data, status, headers, config) {  

	  	// Save the data for later checks
	  	$scope.fileData = data;

	    // If the JSON-file was downloaded successfully, we populate all the dropdowns (files, columns) on the start screen
	    $scope.datasets = [];
	    for(var i = 0; i < data.Files.length; i++){
	    	$scope.datasets.push(updateDataset(data.Files, i));
	    }
	    $scope.files = []; 
	    for(var file in data.Files) {
	    	$scope.files.push(data.Files[file].Name);
	    }
	    $scope.currentDataset = updateDataset(data.Files, 0);
	    $scope.selectedFile = $scope.files[0];
	   	console.log("Current Dataset = ", $scope.currentDataset);

	    // Based on the selection of dataset, we populate the other dropdowns
	    $scope.populateDropdowns = function(){
			var indexSelectedDataset = $scope.files.indexOf($scope.selectedFile);
			// If the index is equal to -1, 'Add file..' was selected
			if(indexSelectedDataset != -1){
				$scope.currentDataset = updateDataset(data.Files, indexSelectedDataset);
				console.log("Current Dataset = ", $scope.currentDataset);
			} else {
				// TODO: Open a file browser so that the user can select a file to load
				$scope.currentDataset.columns=[];
			}
		};
	  }).
	  error(function(data, status, headers, config) {
	    // TODO: show an error message on the homepage
	  });

	// This function is called when the user presses the 'Add' button and adds a dataset to a list to be downloaded later on.
	$scope.addDataset = function(){
		if($scope.userDatasets.length < MAX_DATASETS){
			if(containsDataset($scope.currentDataset, $scope.userDatasets) == -1){
				var copy = jQuery.extend(true, {}, $scope.currentDataset);
				$scope.userDatasets.push(copy);
			} else {
				// TODO: write error message that it is already in the list
			}
		} else {
			// TODO: write error message that maximum 3 different datasets are allowed
		}
	};

	$scope.removeDataset = function(){
		$scope.userDatasets.splice(containsDataset($scope.currentDataset, $scope.userDatasets), 1);
	}

	$scope.changeDataset = function(obj){
		$scope.currentDataset = obj;
		$scope.selectedFile = obj.name;
	}

	/*var Lst;

	function changeClass(obj){
		if (Lst) Lst.className='list-group-item';
		obj.className+=' active';
		Lst=obj;
	}*/

  	// This function is called when the user presses the 'Finish' button and downloads all datasets from the list.
	$scope.downloadData = function(){
		if($scope.fileData != null){
			for(var i = 0; i < $scope.userDatasets.length; i++){
				$http.get($scope.userDatasets[i].path).
			  		success(function(data, status, headers, config) { 
			  			console.log("Data = ", data);
			  			// TODO: validate all columns
			  		}).
			  		error(function(data, status, headers, config) {
				    	// TODO: show an error message on the homepage
					});
			}
		}
	};

  }]);

	


