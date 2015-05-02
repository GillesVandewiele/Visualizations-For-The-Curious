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

	var aggregatedValuesPerDate = [];

	var groupedValues = [];

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

	Date.prototype.getWeekNumber = function(){
	    var d = new Date(+this);
	    d.setHours(0,0,0);
	    d.setDate(d.getDate()+4-(d.getDay()||7));
	    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
	};

	// This function will filter all the values on a certain date, aggregated is a boolean telling if data is aggregated or not
	// IMPORTANT: data must be the same length as times.
	function filterByDay(index, date, data, aggregated){
		var results = {};
		var counter = 0;
		if(data.length != times[index].length){
			console.log("ERROR: times and data are not same length");
			return;
		}
		for(var i=0; i<times[index].length; i++){
			var dictTime = new Date(timesDict[index][times[index][i]].name);
			if(dictTime.getFullYear() == date.getFullYear() && dictTime.getDate() == date.getDate() && dictTime.getMonth() == date.getMonth()){
				console.log(dictTime);
				if(aggregated || locations[index].length == 0){
					// If the values are aggregated, we lost the location information, which is unretrievable from here
					for(var j = 0; j < data.length; j++){
						results.push(data[j]);
					}
				}else {
					// If the values are not aggregated (or if no locations are specified), we store them per location
					for(var j=0;j<locations[index][i].length; j++){
						if(!results[locations[index][i][j]]){
							results[locations[index][i][j]] = [];
							counter++;
							console.log("The counter is at this moment ", counter);
						}
						results[locations[index][i][j]].push(values[index][i][j]);
					}
				}
			}
			// We know the dates are sorted, so as soon as we see a date that exceeds the searched date, we stop looking
			if(dictTime.getFullYear() > date.getFullYear()){
				return results;
			}
			if(dictTime.getFullYear() == date.getFullYear() && dictTime.getMonth() > date.getMonth()){
				return results;
			}
			if(dictTime.getFullYear() == date.getFullYear() && dictTime.getMonth() == date.getMonth() && dictTime.getDate() > date.getDate()){
				console.log(results);
				return results;
			}
		}
		return results;
	};

	function aggregateData(index){
		//for now we will pretend no aggregation or grouping is given
		times[index] = jsonPath(actualData[index], userDatasets[index].date.Path);
		var tmpValues = jsonPath(actualData[index], userDatasets[index].value.Path);
		console.log(userDatasets[index].location);		
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
			if(tmpLocations.length > 0) {
				locations[index][i] = tmpLocations.slice(i*entriesPerTime,(i+1)*entriesPerTime);
			}
		}

		valuesTitles[index] = userDatasets[index].value.Name;

		/*for(var i=0; i<timesLength; i++){
			if(valuesDict[index].length == 0){
				console.log(values[index][i], " occured on ")
			} else {
				console.log(values[index][i], " (= ", valuesDict[index][values[index][i]],") occured on")
			}
			if(timesDict[index].length == 0){
				console.log(times[index][i], " on location ")
			} else {
				console.log(times[index][i], " (= ", timesDict[index][times[index][i]],") on location ")
			}
			if(locations.length == 0){
				console.log("N.A.")
			}else {
				if(locationsDict[index].length == 0){
					console.log(locations[index][i])
				} else {
					console.log(locations[index][i], " (= ", locationsDict[index][locations[index][i]],")")
				}
			}
			console.log("----------------------------------")
		}*/
		// Aggregate the values based on location and date, and store them in aggregatedValuesPerDate
		// Had some troubles, AGAIN, with switches in javascript (<-- shitty language)
		aggregatedValuesPerDate[index] = [];
		console.log("Aggregating on ", userDatasets[index].aggregation);
		if(userDatasets[index].aggregation == 'MEAN'){
			for(var i=0; i<timesLength; i++){		
				var sum = 0;
				var count = 0;
				for(var j = 0; j < values[index][i].length; j++){
					sum += values[index][i][j];
					count++;
				}
				aggregatedValuesPerDate[index][i] = sum/count;
			}
		} else if(userDatasets[index].aggregation == 'SUM'){
			for(var i=0; i<timesLength; i++){					
				var sum = 0;
				for(var j = 0; j < values[index][i].length; j++){
					sum += values[index][i][j];
				}
				aggregatedValuesPerDate[index][i] = sum;
			}
		} else if(userDatasets[index].aggregation == 'MAX'){
			for(var i=0; i<timesLength; i++){	
				aggregatedValuesPerDate[index][i] = Math.max.apply(null, values[index][i]);
			}
		} else if(userDatasets[index].aggregation == 'MIN'){
			for(var i=0; i<timesLength; i++){	
				aggregatedValuesPerDate[index][i] = Math.min.apply(null, values[index][i]);
			}
		}
		else if(userDatasets[index].aggregation == 'COUNT'){
			// In case of COUNT, the values are stored in dictionnaries. But no worries, we can use the compressed value to count.
			for(var i=0; i<timesLength; i++){
				var counts = {};
				for(var j=0; j<values[index][i].length; j++){
					// If there is no entry of this value in the counts, we create one, else we increment this entry
					counts[values[index][i][j]] = counts[values[index][i][j]] ? counts[values[index][i][j]]+1 : 1;
				}
				aggregatedValuesPerDate[index][i] = counts;
			}
		}
		console.log(aggregatedValuesPerDate[index]);

		// We now group the values based on their dates. For this, we need to take a peak in the dictionaries.
		groupedValues[index] = {};
		console.log("Grouping on ", userDatasets[index].grouping);
		if(userDatasets[index].grouping =='WEEKDAY'){
			for(var i = 0; i < timesLength; i++){
				// We check if the dates are compressed using a dict
				if(timesDict[index])
					var parsed = new Date(timesDict[index][times[index][i]].name);
				else
					var parsed = new Date(times[index][i]);

				// Get the weekday from the parsed date and initialize an object or array on that index if needed
				var weekday = parsed.getDay(); // Sunday = 0
				if(!groupedValues[index][weekday])
					if(locations[index][i])
						groupedValues[index][weekday]= {};
					else
						groupedValues[index][weekday]= [];

				// If locations are given, we store the values per location. Else, we just store a list per weekday
				if(locations[index][i]){
					for(var j=0; j < locations[index][i].length; j++){
						if(!groupedValues[index][weekday][locations[index][i][j]])
							groupedValues[index][weekday][locations[index][i][j]] = [];
						groupedValues[index][weekday][locations[index][i][j]].push(values[index][i][j]);
					}
				} else{
					groupedValues[index][weekday].push(values[index][i][j]);
				}
			}
		} else if(userDatasets[index].grouping == 'WEEKS'){
			for(var i = 0; i < timesLength; i++){
				if(timesDict[index])
					var parsed = new Date(timesDict[index][times[index][i]].name);
				else
					var parsed = new Date(times[index][i]);

				var week = parsed.getWeekNumber(); // Sunday = 0
				if(!groupedValues[index][week])
					if(locations[index][i])
						groupedValues[index][week]= {};
					else
						groupedValues[index][week]= [];

				if(locations[index][i]){
					for(var j=0; j < locations[index][i].length; j++){
						if(!groupedValues[index][week][locations[index][i][j]])
							groupedValues[index][week][locations[index][i][j]] = [];
						groupedValues[index][week][locations[index][i][j]].push(values[index][i][j]);
					}
				} else{
					groupedValues[index][week].push(values[index][i][j]);
				}
			}
		} else if(userDatasets[index].grouping == 'MONTH'){
			for(var i = 0; i < timesLength; i++){
				if(timesDict[index])
					var parsed = new Date(timesDict[index][times[index][i]].name);
				else
					var parsed = new Date(times[index][i]);

				var month = parsed.getMonth(); // Sunday = 0
				if(!groupedValues[index][month])
					if(locations[index][i])
						groupedValues[index][month]= {};
					else
						groupedValues[index][month]= [];

				if(locations[index][i]){
					for(var j=0; j < locations[index][i].length; j++){
						if(!groupedValues[index][month][locations[index][i][j]])
							groupedValues[index][month][locations[index][i][j]] = [];
						groupedValues[index][month][locations[index][i][j]].push(values[index][i][j]);
					}
				} else{
					groupedValues[index][month].push(values[index][i][j]);
				}
			}
		} else if(userDatasets[index].grouping == 'YEAR'){
			for(var i = 0; i < timesLength; i++){
				if(timesDict[index])
					var parsed = new Date(timesDict[index][times[index][i]].name);
				else
					var parsed = new Date(times[index][i]);

				var year = parsed.getFullYear(); // Sunday = 0
				if(!groupedValues[index][year])
					if(locations[index][i])
						groupedValues[index][year]= {};
					else
						groupedValues[index][year]= [];

				if(locations[index][i]){
					for(var j=0; j < locations[index][i].length; j++){
						if(!groupedValues[index][year][locations[index][i][j]])
							groupedValues[index][year][locations[index][i][j]] = [];
						groupedValues[index][year][locations[index][i][j]].push(values[index][i][j]);
					}
				} else{
					groupedValues[index][year].push(values[index][i][j]);
				}
			}
		}
		console.log(groupedValues[index]);
		
		console.log("Now let's check which values occurred on 5 June 2014...")
		filterByDay(index, new Date(2014, 5, 5), values[index], false);

		console.log("And again, but now for aggregated values...")
		filterByDay(index, new Date(2014, 5, 5), aggregatedValuesPerDate[index], true);

	};

	/***************** GET DATA FROM SERVICE ********************/

	this.getGroupedValues = function(index){
		return groupedValues[index];
	};

	//function returning the number of datasets in the service
	this.getNumDatasets = function(){
		return count;
	};

	//return the values: in some cases a dict will be necessary to map numbers to text
	this.getValues = function(index){
		return values[index];
	};

	//return the valuesTitle:
	this.getValuesTitle = function(index){
		return valuesTitles[index];
	};

	//return the aggregation parameter selected by the user
	this.getAggregationType = function(index){
		return userDatasets[index].aggregation;
	};

	//a getter for the aggregated values per date
	this.getAggregatedValuesPerDate = function(index){
		return aggregatedValuesPerDate[index];
	};

	//return the times: dict will be necessary to convert numbers to real times
	this.getTimes = function(index){
		return times[index];
	};

	//returns the locations: dict will be necessary to convert numbers to real locations
	this.getLocations = function(index){
		return locations[index];
	};

	//function returning the valuesDict
	this.getValuesDict = function(index){
		return valuesDict[index];
	};

	//function returning the timesDict
	this.getTimesDict = function(index){
		return timesDict[index];	
	};

	//function returning the locationsDict
	this.getLocationsDict = function(index){
		return locationsDict[index];
	};


  }]);
