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

	var dataIsLoading = []


	/*************** DECLARE USERSDATASETS **********************/

	//add one dataset a the time
	this.addOneDataset = function(d){
		userDatasets[count] = d;
		count++;
		dataIsLoading[count] = false;

		loadDataInService();
	};

	//add mutliple datasets at once
	this.addMultipleDatasets = function(ds){
		for(var i=0;i<ds.length;i++){
			userDatasets[count] = ds[i];
			count++;
			dataIsLoading[count] = false;		
		}

		loadDataInService();
	};

	this.deleteDatasets = function(){
		userDatasets = [];
		count = 0;

		actualData = [];
		timesDict = [];
		locationsDict = [];

		values = [];
		times = [];
		locations = [];

		dataIsLoading = [];
	}



	/*************** LOAD THE DATA INTO THE SERVICE ***************/

	function loadDataset(index){
		var deferred = $q.defer();

		//hack to make return wait until userDataset has been loaded.
		//this is missing the purpose of promises...
		//must be checked
		while(userDatasets[index] == undefined || userDatasets == undefined){}
		deferred.resolve(index);

		return deferred.promise;
	}

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

	function loadDataInService() {
		//fist make sure userDatasets is loaded
		for(var i=0; i<count; i++){
			if(!dataIsLoading[i]){
				var promiseDataset = loadDataset(i);

				promiseDataset
					.then(function(index){
						var promiseActualData = loadActualData(index);

						//problem: when giving i as parameter for aggregateData: i is already incremented when entering the .then

						promiseActualData
							.then(function(index){
								aggregateData(index);
							});

						loadTimesDict(index);
						loadLocationsDict(index);
					})

				dataIsLoading[i] = true;
			}
		}
	}


	/***************** GET DATA FROM SERVICE ********************/
	this.getNumDatasets = function(){
		return count;
	}

	this.getValues = function(index){
	    var deferredGetValues = $q.defer();
 
	    if(index < count){	    	
		    //wait until values are loaded
	    	while(values[index] == undefined){}
			deferredGetValues.resolve(values);	
	    } else {
	    	deferredGetValues.reject('No dataset with index '+index);
	    }

		return deferredGetValues.promise;	
	}

	this.getTimes = function(index){
	    var deferredGetTimes = $q.defer();

	    if(index < count){	  
		    //wait until times are loaded
	    	while(times[index] == undefined){}
			deferredGetTimes.resolve(times);
		} else {
			deferredGetTimes.reject('No dataset with index '+index);
		}
		return deferredGetTimes.promise;	
	}

	this.getLocations = function(index){
	    var deferredGetLocations = $q.defer();

	    if(index < count){	  
	    //wait until locations are loaded
	    	while(locations[index] == undefined){}
			deferredGetLocations.resolve(locations);
		} else {
			deferredGetLocations.reject('No dataset with index '+index);
		}

		return deferredGetLocations.promise;	
	}

  }]);
