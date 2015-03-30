'use strict';

/*
	TODO:
		- ERROR HANDLING (HTTP ERRORS + USER INPUT ERRORS)
		- VALIDATE COLUMNS
		- PASS THROUGH REQUIRED INFORMATION IN ORDER TO VISUALIZE EVERYTHING
		- LET USER ADD HIS OWN FILES

		- CLEAN UP CODE
		- WRITE TEST?
*/

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

	  	$scope.aggregations = ["NONE", "MEAN", "SUM", "MAX", "MIN", "COUNT"];
	  	$scope.grouping = ["NONE", "WEEKDAY", "WEEKS", "MONTH", "YEAR"];

	  	$scope.files; // Extra array for faster lookup in the datasets based on name
	  	$scope.selectedFile;

	  	$scope.datasets; 	// All datasets that were retrieved from the server 
	  						// Fields: location, value, aggregation, date, grouping
	  	$scope.userDatasets = []; // The defined datasets by the user
	  	$scope.currentDataset;

	  	$scope.errorMessage = ""; // Used to show all errors

  	/*************************************************/

  	/************* PRIVATE FUNCTIONS *****************/

  	// Private function to create a dataset (which has a lot of properties)
  	var updateDataset = function(data, index){
  		var dataset = {name:data[index].Name, columns:data[index].Columns, location:{Path:data[index].Columns[0].Path, Name:data[index].Columns[0].Name},
  		 value:{Path:data[index].Columns[1].Path, Name:data[index].Columns[1].Name},date:{Path:data[index].Columns[data[index].Columns.length-1].Path,
  		  Name:data[index].Columns[data[index].Columns.length-1].Name}, path:data[index].Path, aggregation:$scope.aggregations[0], 
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
  	}

  	// Check if dataset is in userDatasets using datasetTracker
	var containsDataset = function(dataset, userDatasets){
		for(var i = 0; i < userDatasets.length; i++){
			if(datasetTracker(userDatasets[i]) == datasetTracker(dataset)){
				return i;
			}
		}
		return -1;
	}

	// Private function to show an error message on top of the page
	var showErrorMessage = function(message){
		show('alert');
		$scope.errorMessage = message;
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
	    //$scope.currentDataset = updateDataset(data.Files, 0);
	    //$scope.selectedFile = $scope.files[0];

	  }).
	  error(function(data, status, headers, config) {
	  	showErrorMessage("We were unable to retrieve files.json from the server.");
	  });

	// Based on the selection of dataset, we populate the other dropdowns
	$scope.$watch('selectedFile', function(){
    	if($scope.fileData != null){
			var indexSelectedDataset = $scope.files.indexOf($scope.selectedFile);
			// If the index is equal to -1, 'Add file..' was selected
			if(indexSelectedDataset != -1){
				$scope.currentDataset = updateDataset($scope.fileData.Files, indexSelectedDataset);
			} else {
				showFileExplorer();
			}
		}
	});

	// This function is called when the user presses the '+' button and adds a dataset to a list to be downloaded later on.
	$scope.addDataset = function(){
		if($scope.currentDataset != null){
			if($scope.userDatasets.length < MAX_DATASETS){
				if(containsDataset($scope.currentDataset, $scope.userDatasets) == -1){
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
    	//document.getElementById("datasetMenu").value = value;
	}

	// This function is called when the user presses the '-' button and removes the selected dataset.
	$scope.removeDataset = function(){
		$scope.userDatasets.splice(containsDataset($scope.currentDataset, $scope.userDatasets), 1);
	}

	// Function is called when the user clicks an element in the list of datasets
	$scope.changeDataset = function(obj){-
		console.log(obj);
		//document.getElementById("datasetMenu").value = obj.name;
		//change = false;
		$scope.selectedFile = obj.name;
		$scope.currentDataset = obj;
		$scope.currentDataset.location = $scope.currentDataset.columns[searchInColumns($scope.currentDataset.location.Name, $scope.currentDataset.columns)];
		$scope.currentDataset.value = $scope.currentDataset.columns[searchInColumns($scope.currentDataset.value.Name, $scope.currentDataset.columns)];
		$scope.currentDataset.date = $scope.currentDataset.columns[searchInColumns($scope.currentDataset.date.Name, $scope.currentDataset.columns)];
-
		console.log($scope.currentDataset.location.Name);
	}

  	// This function is called when the user presses the 'V' button and downloads all datasets from the list.
	$scope.downloadData = function(){
		for(var i = 0; i < $scope.userDatasets.length; i++){
			$http.get($scope.userDatasets[i].path).
		  		success(function(data, status, headers, config) { 
		  			// TODO: extract the correct columns, using "Path"

		  			// TODO: validate all columns (wait for right Date format etc)
		  		}).
		  		error(function(data, status, headers, config) {
			    	showErrorMessage("We were unable to download the requested data.");
				});
		}
	};

  }]).directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                        console.log("fileread =", scope.fileread);
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
  }]);


// The two functions below are to show and hide the error message box.
var show = function(target) {
    document.getElementById(target).style.display = 'block';
}

var hide = function(target) {
    document.getElementById(target).style.display = 'none';
}

var showFileExplorer = function(target){
	$('#fileExplorer').fileTree({ root: '/' }, function(file) {
        alert(file);
    });
}
