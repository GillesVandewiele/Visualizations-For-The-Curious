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

	var valuesTitles = [];
	var values = [];
	var times = [];
	var locations = [];

	var returnData = [];

	var dataIsLoading = [];


	/*************** DECLARE USERSDATASETS **********************/

	//add one dataset a the time
	this.addOneDataset = function(d, callbackSuccess, callbackFail){
		userDatasets[count] = d;
		count++;
		dataIsLoading[count] = false;

		loadDataInService(callbackSuccess, callbackFail);
	};

	//add mutliple datasets at once
	this.addMultipleDatasets = function(ds, callbackSuccess, callbackFail){
		for(var i=0;i<ds.length;i++){
			userDatasets[count] = ds[i];
			count++;
			dataIsLoading[count] = false;		
		}

		loadDataInService(callbackSuccess, callbackFail);
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

	//function that loads the locations dictionnary of all the datasets
	function loadValuesDict(index){
		var deferred = $q.defer();

		if(userDatasets[index].value.Dict ==! ""){
			var deferredValuesDict = $q.defer();
			var promiseValuesDict = deferredValuesDict.promise;
			promiseValuesDict = $http.get(userDatasets[index].value.Dict);

			promiseValuesDict
				.then(function(data){
					valuesDict[index] = jsonPath(data.data, userDatasets[index].value.Dict_mapping);
					deferredValuesDict.resolve(valuesDict[index]);
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
				timesDict[index] = jsonPath(data.data, userDatasets[index].date.Dict_mapping); // TODO: get dict json path
				deferredTimesDict.resolve(timesDict[index]);
				deferred.resolve(index);
				return deferred.promise;
			});

		return deferred.promise;
	}

	//function that loads the locations dictionnary of all the datasets
	function loadLocationsDict(index){
		if(userDatasets[index].location){
			var deferred = $q.defer();

			var deferredLocationsDict = $q.defer();
			var promiseLocationsDict = deferredLocationsDict.promise;
			promiseLocationsDict = $http.get(userDatasets[index].location.Dict);

			promiseLocationsDict
				.then(function(data){
					locationsDict[index] = jsonPath(data.data, userDatasets[index].location.Dict_mapping);
					deferredLocationsDict.resolve(locationsDict[index]);
					deferred.resolve(index);
					return deferred.promise;
				});
			
			return deferred.promise;
		}
		return null;
	}

	//function loading all data into the service
	function loadDataInService(callbackSuccess, callbackFail) {
		//fist make sure userDatasets is loaded
		var promiseDatasets = [];

		for(var i=0; i<count; i++){
			if(!dataIsLoading[i]){
				var promiseDataset = loadDataset(i);

				promiseDatasets.push(promiseDataset);

				dataIsLoading[i] = true;
			}
		}

		// promiseDataset
		// 			.then(function(index){
		// 				loadValuesDict(index);
		// 				loadTimesDict(index);
		// 				loadLocationsDict(index);
						
		// 				var promiseActualData = loadActualData(index);

		// 				promiseActualData
		// 					.then(function(index){
		// 						aggregateData(index);
		// 					});
		// 			})

		$q.all(promiseDatasets).then(function(arrayOfResults){
			var ind;
			var loadPromises=[];

			for(ind=0;ind<arrayOfResults.length;ind++){
				loadPromises.push(loadValuesDict(ind));
				loadPromises.push(loadTimesDict(ind));
				loadPromises.push(loadLocationsDict(ind));
				loadPromises.push(loadActualData(ind));
			}

			$q.all(loadPromises).then(function(loadResults){
				var ind2;
				var amt=loadResults.length/4;
				for(ind2=0;ind2<amt;ind2++){
					aggregateData(ind2);
				}

				if(callbackSuccess){
					callbackSuccess();
				}

			},function(){
				//when a load promise is rejected
				if(callbackFail){
					callbackFail();
				}
			});

		},function(){
			//when a promiseDataset is rejected
			if(callbackFail){
				callbackFail();
			}
		});
	}


	/***************** AGGREGATION FUNCTIONS *********************/

	function aggregateData(index){
		//for now we will pretend no aggregation or grouping is given
		times[index] = jsonPath(actualData[index], userDatasets[index].date.Path);
		var tmpValues = jsonPath(actualData[index], userDatasets[index].value.Path);		
		if(userDatasets[index].location){
			var tmpLocations = jsonPath(actualData[index], userDatasets[index].location.Path);
		} else {
			var tmpLocations = [];
		}

		var timesLength = times[index].length;
		var entriesPerTime = tmpValues.length/timesLength;

		values[index] = [];
		locations[index] = [];

		for(var i=0; i<timesLength; i++){
			values[index][i] = tmpValues.slice(i*entriesPerTime,(i+1)*entriesPerTime);
			locations[index][i] = tmpLocations.slice(i*entriesPerTime,(i+1)*entriesPerTime);
		}

		valuesTitles[index] = userDatasets[index].value.Name;
	}

	/***************** GET DATA FROM SERVICE ********************/

	//function returning the number of datasets in the service
	this.getNumDatasets = function(){
		return count;
	}

	//return the values: in some cases a dict will be necessary to map numbers to text
	this.getValues = function(index){
		return values[index];
	}

	//return the valuesTitle:
	this.getValuesTitle = function(index){
		return valuesTitles[index];
	}

	//TODO: Implement these methods
	this.getAggregationType = function(index){
		return userDatasets[index].aggregation;
	}

	//return the times: dict will be necessary to convert numbers to real times
	this.getTimes = function(index){
		return times[index];
	}

	//returns the locations: dict will be necessary to convert numbers to real locations
	this.getLocations = function(index){
		return locations[index];
	}

	//function returning the valuesDict
	this.getValuesDict = function(index){
		return valuesDict[index];
	}

	//function returning the timesDict
	this.getTimesDict = function(index){
		return timesDict[index];	
	}

	//function returning the locationsDict
	this.getLocationsDict = function(index){
		return locationsDict[index];
	}


  }]);
