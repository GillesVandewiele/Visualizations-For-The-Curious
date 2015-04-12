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

	var values = [];
	var times = [];
	var locations = [];

	var valuesLoaded = [];
	var timesLoaded = [];
	var locationsLoaded = [];


	/*************** DECLARE USERSDATASETS **********************/

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



	/*************** LOAD THE DATA INTO THE SERVICE ***************/

	//function that loads the actual data of all the datasets
	function loadActualData(index){
		var deferred = $q.defer();

		var deferredData = $q.defer();
		var promiseData = deferredData.promise;
		promiseData = $http.get(userDatasets[index].path);

		promiseData
			.then(function(data){
				actualData[index] = data.data;
				deferredData.resolve(actualData[index]);
				deferred.resolve(index);
				return deferred.promise;
			});

		return deferred.promise;
	}

	//function that loads the times dictionnary of all the datasets
	function loadTimesDict(index){
		var deferred = $q.defer();

		var deferredTimesDict = $q.defer();
		var promiseTimesDict = deferredTimesDict.promise;
		promiseTimesDict = $http.get(userDatasets[index].date.Dict);

		promiseTimesDict
			.then(function(data){
				timesDict[index] = jsonPath(data.data, "$.times[*]");
				deferredTimesDict.resolve(timesDict[index]);
				deferred.resolve(index);
				return deferred.promise;
			});

		return deferred.promise;
	}

	//function that loads the locations dictionnary of all the datasets
	function loadLocationsDict(index){
		var deferred = $q.defer();

		var deferredLocationsDict = $q.defer();
		var promiseLocationsDict = deferredLocationsDict.promise;
		promiseLocationsDict = $http.get(userDatasets[index].location.Dict);

		promiseLocationsDict
			.then(function(data){
				locationsDict[index] = jsonPath(data.data, "$.routes[*]");
				deferredLocationsDict.resolve(locationsDict[index]);
				deferred.resolve(index);
				return deferred.promise;
			});
		
		return deferred.promise;
	}

	/***************** AGGREGATION FUNCTIONS *********************/

	function aggregateData(index){
		//uses actualData and timesDict to aggregate given userDatasets[index].aggregation and userDatasets[index].aggregation

		//for now we will pretend no aggregation or grouping is given


		values = jsonPath(actualData[index], userDatasets[index].value.Path);
		times = jsonPath(actualData[index], userDatasets[index].date.Path);
		locations = jsonPath(actualData[index], userDatasets[index].location.Path);
	}

	
	/***************** INITIALISE DATASERVICE *******************/
	this.loadDataInService = function() {
		//fist make sure userDatasets is loaded
		for(var i=0; i<count; i++){
			while(userDatasets[i] == undefined){}

			var promiseData = loadActualData(i);

			//problem: when giving i as parameter for aggregateData: i is already incremented when entering the .then

			promiseData
				.then(function(index){
					aggregateData(index);
				});

			loadTimesDict(i);
			loadLocationsDict(i);
		}
	}


	/***************** GET DATA FROM SERVICE ********************/
	this.getNumDatasets = function(){
		return count;
	}

	this.getValues = function(index){
	    var deferredGetValues = $q.defer();

	    //wait until values are loaded
    	while(!valuesLoaded[index]){
    	}

		deferredGetValues.resolve(values);	
		return deferredGetValues.promise;	
	}

	this.getTimes = function(index){
	    var deferredGetTimes = $q.defer();

	    //wait until times are loaded
    	while(!timesLoaded[index]){
    	}

		deferredGetTimes.resolve(values);
		return deferredGetTimes.promise;	
	}

	this.getLocations = function(index){
	    var deferredGetLocations = $q.defer();

	    //wait until locations are loaded
    	while(!locationsLoaded[index]){
    	}

		deferredGetLocations.resolve(values);
		return deferredGetLocations.promise;	
	}

  }]);
