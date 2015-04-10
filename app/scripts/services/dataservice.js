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

	this.getDatasets = function(){
		return dataset;	
	};	

		
  });
