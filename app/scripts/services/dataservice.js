'use strict';

/**
 * @ngdoc service
 * @name dataVisualizationsApp.dataService
 * @description
 * # dataService
 * Service in the dataVisualizationsApp.
 */
angular.module('dataVisualizationsApp.services')
  .service('dataService', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
	// Present data when required
	// Use functions
	
	//$scope.userDataSets bevat datasets
	//datasets bevatten name, path, array columns, voor elk element in de array naam van de column, json path naar die column en later nog een dict.
	
	var dataset = [];
	var count = 0;

	this.addOneDataset = function(d){
		dataset[count] = d;
		count++;	
	};

	this.addMultipleDatasets = function(ds){
		for(var i=0;i<ds.length;i++){
			dataset[count] = ds[i];
			count++;			
		}		
	};

	this.getDataset = function(){
		return dataset;	
	};
	
	
  });
