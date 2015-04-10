'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controller:DataselectionCtrl
 * @description Controller of the dataVisualizationsApp. Downloads a JSON-file from the server to populate all dropdowns and validates the user input.
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('DataselectionCtrl', ['$scope', '$http', '$localStorage', function ($scope, $http, $localStorage) {

  	/****************** CONSTANTS ********************/

  		var MAX_DATASETS = 3;

  	/*************************************************/

  	/****** VARIABLES USED IN START SCREEN VIEW ******/

	  	$scope.aggregations = ["NONE", "MEAN", "SUM", "MAX", "MIN", "COUNT"];
	  	$scope.grouping = ["NONE", "WEEKDAY", "WEEKS", "MONTH", "YEAR"];

	  	$scope.selectedFile;

	  	$localStorage.datasets; 	// All datasets that were retrieved from the server 
	  						        // Fields: location, value, aggregation, date, grouping
		$scope.datasets = $localStorage.datasets;

	  	$scope.userDatasets = []; // The defined datasets by the user
	  	$scope.currentDataset;

	  	$scope.errorMessage = ""; // Used to show all errors

  	/*************************************************/

  	/************* PRIVATE FUNCTIONS *****************/

  	// Private function to create a dataset (which has a lot of properties)
  	var updateDataset = function(data, index){
  		var dataset = {name:data[index].Name, columns:data[index].Columns, path:data[index].Path, aggregation:$scope.aggregations[0], 
  		  grouping:$scope.grouping[0]};
  		dataset.location = dataset.columns[0];
		dataset.value = dataset.columns[1];
		dataset.date = dataset.columns[dataset.columns.length - 1];
		return dataset;
  	};

  	// Private function to check if two specified datasets are not unique
  	var datasetTracker = function(dataset){
  		return dataset.name + dataset.location.Name + dataset.value.Name + dataset.date.Name + dataset.aggregation + dataset.grouping;
  	};

  	var searchInColumns = function(name, columns){
  		for(var i = 0; i < columns.length; i++){
  			if(columns[i].Name == name){
  				return i;
  			}
  		}
  		return -1;
  	};

  	var searchDatasetsByName = function(datasets, name){
  		for(var i = 0; i < datasets.length; i++){
  			if(datasets[i].name == name){
  				return i;
  			}
  		}
  		return -1;
  	}

  	// Check if dataset is in userDatasets using datasetTracker
	var containsDataset = function(dataset, userDatasets){
		for(var i = 0; i < userDatasets.length; i++){
			if(datasetTracker(userDatasets[i]) == datasetTracker(dataset)){
				return i;
			}
		}
		return -1;
	};

	// Private function to show an error message on top of the page
	var showErrorMessage = function(message){
		show('alert');
		$scope.errorMessage = message;
	};

	// Private function to check if the value column is correct
	var validateValueColumn = function(column){
		for(var value in column){
			if(typeof(column[value]) != "string" && isNaN(column[value]) ){
				return false;
			}
		}
		return true;
	};

	var validateDateColumn = function(column){
		for(var i = 0; i < 100; i++){
			console.log(column[i]);
		}
	};

	var validateLocationColumn = function(column){
		for(var i = 0; i < 100; i++){
			console.log(column[i]);
		}
	};

  	/************************************************/

  	if($localStorage.datasets == null){
	    $http.get('data/files.json').
		  success(function(data, status, headers, config) {  
		    // If the JSON-file was downloaded successfully, we populate all the dropdowns (files, columns) on the start screen
		    $localStorage.datasets=[];
		    for(var i = 0; i < data.Files.length; i++){
		    	$localStorage.datasets.push(updateDataset(data.Files, i));
		    }
		  }).
		  error(function(data, status, headers, config) {
		  	showErrorMessage("We were unable to retrieve files.json from the server.");
		  });
	}

	// Based on the selection of dataset, we populate the other dropdowns
	$scope.$watch('selectedFile', function(){
    	if($localStorage.datasets != null){
			var indexSelectedDataset = searchDatasetsByName($localStorage.datasets, $scope.selectedFile);
			// If the index is equal to -1, 'Add file..' was selected
			console.log(indexSelectedDataset);
			if(indexSelectedDataset != -1){
				$scope.currentDataset = $localStorage.datasets[indexSelectedDataset];
				// Ugly hack to update the dropdowns
				// TODO: try to use $scope.apply();
				$scope.currentDataset.location = $scope.currentDataset.columns[searchInColumns($scope.currentDataset.location.Name, $scope.currentDataset.columns)];
				$scope.currentDataset.value = $scope.currentDataset.columns[searchInColumns($scope.currentDataset.value.Name, $scope.currentDataset.columns)];
				$scope.currentDataset.date = $scope.currentDataset.columns[searchInColumns($scope.currentDataset.date.Name, $scope.currentDataset.columns)];
				$scope.currentDataset.aggregation = $scope.aggregations[0];
				$scope.currentDataset.grouping = $scope.grouping[0];
			}
		}
	});

	// This function is called when the user presses the '+' button and adds a dataset to a list to be downloaded later on.
	$scope.addDataset = function(){
		if($scope.currentDataset != null){
			if($scope.userDatasets.length < MAX_DATASETS){
				if(containsDataset($scope.currentDataset, $scope.userDatasets) == -1){
					// Take a deep copy
					var copy = jQuery.extend(true, {}, $scope.currentDataset);
					$scope.userDatasets.push(copy);
				} else {
					showErrorMessage("The list already contains this dataset with these columns!");
				}
			} else {
				showErrorMessage("We support only up to three datasets!");
			}
		} else {
			showErrorMessage("No dataset provided!");
		}
	};

	$scope.updateDataset=function(value){
		$scope.selectedFile = value
	}

	// This function is called when the user presses the '-' button and removes the selected dataset.
	$scope.removeDataset = function(){
		$scope.userDatasets.splice(containsDataset($scope.currentDataset, $scope.userDatasets), 1);
	}

	// Function is called when the user clicks an element in the list of datasets
	$scope.changeDataset = function(obj){
		$scope.selectedFile = obj.name;
		$scope.currentDataset = obj;
		$scope.currentDataset.location = $scope.currentDataset.columns[searchInColumns($scope.currentDataset.location.Name, $scope.currentDataset.columns)];
		$scope.currentDataset.value = $scope.currentDataset.columns[searchInColumns($scope.currentDataset.value.Name, $scope.currentDataset.columns)];
		$scope.currentDataset.date = $scope.currentDataset.columns[searchInColumns($scope.currentDataset.date.Name, $scope.currentDataset.columns)];
	}

	$scope.printData = function(dataset, jsonData){
		if(jsonData != null){
			var dataset_locations = jsonPath(jsonData, dataset.location.Path);
			var dataset_values = jsonPath(jsonData, dataset.value.Path);
			var dataset_dates = jsonPath(jsonData, dataset.date.Path);
			console.log("is value correct?", validateValueColumn(dataset_values));
			console.log("is date correct?", validateDateColumn(dataset_dates));
			console.log("is location correct?", validateLocationColumn(dataset_locations));
		}
	}

	$scope.resetLocalStorage = function(dataset, jsonData){
		$localStorage.$reset();
		document.location.reload(true);
	}

  	// This function is called when the user presses the 'V' button and downloads all datasets from the list.
	$scope.downloadData = function(){
		for(var i = 0; i < $scope.userDatasets.length; i++){
			console.log($scope.userDatasets[i].path)
			$http.get($scope.userDatasets[i].path, {params: {"dataSetNumber": i}})
		  		.success(function(data, status, headers, config) { 
		  			//Extract right columns (and print them for now)
					$scope.printData($scope.userDatasets[config.params.dataSetNumber], data);

		  			// TODO: validate all columns (wait for right Date format etc)
		  		})
		  		.error(function(data, status, headers, config) {
			    	showErrorMessage("We were unable to download the requested data.");
				});
		}
	};
  }]);


// The two functions below are to show and hide the error message box.
var show = function(target) {
    document.getElementById(target).style.display = 'block';
}

var hide = function(target) {
    document.getElementById(target).style.display = 'none';
}

var hideJsonCode = function(){
	if(document.getElementById("toggleJson").className == "glyphicon glyphicon-minus-sign"){
	    $(document.getElementById("jsonCode")).fadeOut("slow");
	    document.getElementById("toggleJson").className = "glyphicon glyphicon-plus-sign";
	    $(document.getElementById("exampleCode")).fadeIn("slow");
	    document.getElementById("toggleExample").className = "glyphicon glyphicon-minus-sign";
	} else {
		$(document.getElementById("jsonCode")).fadeIn("slow");
	    document.getElementById("toggleJson").className = "glyphicon glyphicon-minus-sign";
	    $(document.getElementById("exampleCode")).fadeOut("slow");
	    document.getElementById("toggleExample").className = "glyphicon glyphicon-plus-sign";
	}
}

var hideExampleCode = function(){
	if(document.getElementById("toggleExample").className == "glyphicon glyphicon-minus-sign"){
	    $(document.getElementById("exampleCode")).fadeOut("slow");
	    document.getElementById("toggleExample").className = "glyphicon glyphicon-plus-sign";
	    $(document.getElementById("jsonCode")).fadeIn("slow");
	    document.getElementById("toggleJson").className = "glyphicon glyphicon-minus-sign";
	} else {
		$(document.getElementById("exampleCode")).fadeIn("slow");
	    document.getElementById("toggleExample").className = "glyphicon glyphicon-minus-sign";
	    $(document.getElementById("jsonCode")).fadeOut("slow");
	    document.getElementById("toggleJson").className = "glyphicon glyphicon-plus-sign";
	}
}
