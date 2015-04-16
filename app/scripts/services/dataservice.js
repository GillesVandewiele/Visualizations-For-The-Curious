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

	var valuesDict = [];
	var timesDict = [];
	var locationsDict = [];

	var values = [];
	var times = [];
	var locations = [];

	var returnData = [];

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
				setWaitingCursor();

				actualData[index] = data.data;
				deferredData.resolve(actualData[index]);
				deferred.resolve(index);

				setDefaultCursor();
				return deferred.promise;
			});

		return deferred.promise;
	}

	//function that loads the locations dictionnary of all the datasets
	function loadValuesDict(index){
		var deferred = $q.defer();

		if(userDatasets[index].value.Dict ==! ""){
			var deferredValuesDict = $q.defer();
			var promiseValuesDict = deferredValuesDict.promise;
			promiseValuesDict = $http.get(userDatasets[index].value.Dict);

			promiseValuesDict
				.then(function(data){
					locationsDict[index] = jsonPath(data.data, "$.data[*]");
					deferredValuesDict.resolve(locationsDict[index]);
					deferred.resolve(index);
					return deferred.promise;
				});
			
			return deferred.promise;

		} else {
			valuesDict[index] = false;
			deferred.resolve(index);

			return deferred.promise;
		}
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

	//function loading all data into the service
	function loadDataInService() {
		//fist make sure userDatasets is loaded
		for(var i=0; i<count; i++){
			if(!dataIsLoading[i]){
				var promiseDataset = loadDataset(i);

				promiseDataset
					.then(function(index){
						loadValuesDict(index);
						loadTimesDict(index);
						loadLocationsDict(index);
						
						var promiseActualData = loadActualData(index);

						promiseActualData
							.then(function(index){
								setWaitingCursor();
								aggregateData(index);
								setDefaultCursor();
							});
					})

				dataIsLoading[i] = true;
			}
		}
	}


	/***************** AGGREGATION FUNCTIONS *********************/

	function aggregateData(index){
		//for now we will pretend no aggregation or grouping is given
		times[index] = jsonPath(actualData[index], userDatasets[index].date.Path);
		var tmpValues = jsonPath(actualData[index], userDatasets[index].value.Path);		
		var tmpLocations = jsonPath(actualData[index], userDatasets[index].location.Path);


		///
		/// TODO: aggregation
		///


		//one problem: we do not know what times belong to which locations and values
		//if we can assume every time entry has an equal amount of value/locations pairs, the problem is solved. --> implemented
		//else actualData can be used and unnecessary attributes can be deleted --> best option --> would require hack i'd rather not implement

		var timesLength = times[index].length;
		var entriesPerTime = tmpValues.length/timesLength;

		values[index] = [];
		locations[index] = [];

		for(var i=0; i<timesLength; i++){
			values[index][i] = tmpValues.slice(i*entriesPerTime,(i+1)*entriesPerTime);
			locations[index][i] = tmpLocations.slice(i*entriesPerTime,(i+1)*entriesPerTime);
		}
	}

	/***************** GET DATA FROM SERVICE ********************/

	//function returning the number of datasets in the service
	this.getNumDatasets = function(){
		return count;
	}

	//return the values: in some cases a dict will be necessary to map numbers to text
	this.getValues = function(index){
	    var deferredGetValues = $q.defer();
 
	    if(index < count){	    	
		    //wait until values are loaded
	    	while(values[index] == undefined){}
			deferredGetValues.resolve(values[index]);	
	    } else {
	    	deferredGetValues.reject('No values with index '+index);
	    }

		return deferredGetValues.promise;	
	}

	//return the times: dict will be necessary to convert numbers to real times
	this.getTimes = function(index){
	    var deferredGetTimes = $q.defer();

	    if(index < count){	  
		    //wait until times are loaded
	    	while(times[index] == undefined){}
			deferredGetTimes.resolve(times[index]);
		} else {
			deferredGetTimes.reject('No times with index '+index);
		}
		return deferredGetTimes.promise;	
	}

	//returns the locations: dict will be necessary to convert numbers to real locations
	this.getLocations = function(index){
	    var deferredGetLocations = $q.defer();

	    if(index < count){	  
	    //wait until locations are loaded
	    	while(locations[index] == undefined){}
			deferredGetLocations.resolve(locations[index]);
		} else {
			deferredGetLocations.reject('No locations with index '+index);
		}

		return deferredGetLocations.promise;	
	}

	//function returning the valuesDict
	this.getValuesDict = function(index){
		var deferredGetValuesDict = $q.defer();

	    if(index < count){	  
	    //wait until timesDict is loaded
	    	while(valuesDict[index] == undefined){}
			deferredGetValuesDict.resolve(valuesDict[index]);
		} else {
			deferredGetValuesDict.reject('No valuesDict with index '+index);
		}

		return deferredGetValuesDict.promise;	
	}

	//function returning the timesDict
	this.getTimesDict = function(index){
		var deferredGetTimesDict = $q.defer();

	    if(index < count){	  
	    //wait until timesDict is loaded
	    	while(timesDict[index] == undefined){}
			deferredGetTimesDict.resolve(timesDict[index]);
		} else {
			deferredGetTimesDict.reject('No timesDict with index '+index);
		}

		return deferredGetTimesDict.promise;	
	}

	//function returning the locationsDict
	this.getLocationsDict = function(index){
		var deferredGetLocationsDict = $q.defer();

	    if(index < count){	  
	    //wait until locationsDict is loaded
	    	while(locationsDict[index] == undefined){}
			deferredGetLocationsDict.resolve(locationsDict[index]);
		} else {
			deferredGetLocationsDict.reject('No locationsDict with index '+index);
		}

		return deferredGetLocationsDict.promise;
	}


  }]);
