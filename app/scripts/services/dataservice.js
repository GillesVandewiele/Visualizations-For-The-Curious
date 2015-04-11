'use strict';

/**
 * @ngdoc service
 * @name dataVisualizationsApp.dataService
 * @description
 * # dataService
 * Service in the dataVisualizationsApp.
 */
angular.module('dataVisualizationsApp.services')
  .service('dataService', ['$q', '$http', function ($q, $http) {	
	var userDatasets = [];
	var count = 0;

	var actualData = [];
	var timesDict = [];
	var locationsDict = [];

	//add one dataset a the time
	this.addOneDataset = function(d){
		userDatasets[count] = d;
		count++;	
	};

	//add mutliple datasets at once
	this.addMultipleDatasets = function(ds){
		for(var i=0;i<ds.length;i++){
			userDatasets[count] = ds[i];
			count++;			
		}
	};

	//get all datasets
	this.getDatasets = function(){
	    var deferredGetDatasets = $q.defer();
    	var promiseGetDatasets = deferredGetDatasets.promise;

    	if(userDatasets.length > 0){
    		deferredGetDatasets.resolve(userDatasets);
    	}

		return deferredGetDatasets.promise;	
	};

	//get dataset with index index
	this.getDataset = function(index){
	    var deferredGetDataset = $q.defer();
    	var promiseGetDataset = deferredGetDataset.promise;

    	if(userDatasets[index]){
    		deferredGetDataset.resolve(userDatasets[index]);
    	}

		return deferredGetDataset.promise;	
	};

	//function returning the actual data of the dataset with index index
	this.getActualData = function(index){
		var deferredGetActualData = $q.defer();
		var promiseGetActualData = deferredGetActualData.promise;

		var datasetInfoPromise = this.getDataset(index);

		datasetInfoPromise
			.then(function(data){
				var deferredData = $q.defer();
				var promiseData = deferredData.promise;
				promiseData = $http.get(userDatasets[index].path);

				promiseData
					.then(function(data){
						actualData[index] = data.data;
						deferredData.resolve(actualData[index]);
						deferredGetActualData.resolve(actualData[index]);
						return deferredGetActualData.promise;
					});
			});

		return deferredGetActualData.promise;
	}

	//function returning the times dictionnary of the dataset with index index
	this.getTimesDict = function(index){
		var deferredGetTimesDict = $q.defer();
		var promiseGetTimesDict = deferredGetTimesDict.promise;

		var datasetInfoPromise = this.getDataset(index);

		datasetInfoPromise
			.then(function(data){
				var deferredTimesDict = $q.defer();
				var promiseTimesDict = deferredTimesDict.promise;
				promiseTimesDict = $http.get(userDatasets[index].date.Dict);

				promiseTimesDict
					.then(function(data){
						timesDict[index] = data.data;
						deferredTimesDict.resolve(timesDict[index]);
						deferredGetTimesDict.resolve(timesDict[index]);
						return deferredGetTimesDict.promise;	
					});
			});

		return deferredGetTimesDict.promise;	
	}

	//function returning the locations dictionnary of the dataset with index index
	this.getLocationsDict = function(index){
		var deferredGetLocationsDict = $q.defer();
		var promiseGetLocationsDict = deferredGetLocationsDict.promise;

		var datasetInfoPromise = this.getDataset(index);

		datasetInfoPromise
			.then(function(data){
				var deferredLocationsDict = $q.defer();
				var promiseLocationsDict = deferredLocationsDict.promise;
				promiseLocationsDict = $http.get(userDatasets[index].location.Dict);

				promiseLocationsDict
					.then(function(data){
						locationsDict[index] = data.data;
						deferredLocationsDict.resolve(locationsDict[index]);
						deferredGetLocationsDict.resolve(locationsDict[index]);
						return deferredGetLocationsDict.promise;
					});
			});

		return deferredGetLocationsDict.promise;
	}

  }]);
