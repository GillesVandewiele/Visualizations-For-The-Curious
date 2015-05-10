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
	
	// Holds the datasets and fields currently chosen by the user
	var userDatasets = [];
	
	// Holds all loaded datasets
	var loadedDatasets = [];
	// Holds a mapping from the names of the loaded datasets to their position
    var nameToIndex = {};

	var groupingTitlesWeekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var groupingTitlesWeeks = [];
	for(var i=1; i<53; i++){
		groupingTitlesWeeks[i-1] = 'Week ' + i;
	}
	var groupingTitlesMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	//not necessary for years: 2014 is a proper grouping title.


	/*************** DECLARE USERSDATASETS **********************/

	// Load one dataset (@Gilles: Is this ever used? If not, feel free to remove)
	this.addOneDataset = function(d, callbackSuccess, callbackFail){
		this.addMultipleDatasets([d], callbackSuccess, callbackFail);
	};

	// Load multiple datasets at once
	this.addMultipleDatasets = function(ds, callbackSuccess, callbackFail){
		console.log('addMultipleDatasets');
		userDatasets = ds;
		var allPromises = [];
		for (var i = 0; i<userDatasets.length; i++) {
			var curDataName = userDatasets[i].name;
			if (!nameToIndex.hasOwnProperty(curDataName)) {
				nameToIndex[curDataName] = loadedDatasets.length;
				loadedDatasets.push({});
			}
			allPromises.push(loadDataInto(userDatasets[i], loadedDatasets[nameToIndex[curDataName]]));
		}
		$q.all(allPromises).then(
			function(){
				console.log('Datasets successfully loaded!');
				if(callbackSuccess){
					callbackSuccess();
				}
			}, function(){
				//when a load promise is rejected
				console.log('Dataset load failed!');
				if(callbackFail){
					callbackFail();
				}
			}
		);
	};

	// Reinitialize this service
	this.deleteDatasets = function(){
		console.log('deleteDatasets');
		userDatasets = [];
		loadedDatasets = [];
		nameToIndex = {};
	};

	// Function that loads one user dataset into the memory. Returns a promise which is fulfilled when the dataset is ready.
	function loadDataInto(description, destination){
		var allPromises = [];
		var datesAvailable = [];
		allPromises.push(loadUrl(description.value.Dict, destination, description.value.Name + '_dict'));
		
		datesAvailable.push(loadUrl(description.date.Dict, destination, description.date.Name + '_dict'));
		if (description.location !== undefined) {
			allPromises.push(loadUrl(description.location.Dict, destination, description.location.Name + '_dict'));
		}
		
		if (!destination.hasOwnProperty('values_promise')) {
			var valuesReady = $q.defer();
			destination.values_promise = valuesReady.promise;
			loadUrl(description.path, destination, 'values').then(
				function() { // success
					storeColumns(description.columns, destination.values, destination);
					delete destination.values;
					valuesReady.resolve();
				},
				function() {
					valuesReady.reject();
				}
			);
		}
		datesAvailable.push(destination.values_promise);
		
		// When both date and values are available, search for days
		if (!destination.hasOwnProperty('dates_promise')) {
			var datesReady = $q.defer();
			destination.dates_promise = datesReady.promise;
			datesAvailable = $q.all(datesAvailable).then(
				function() {
					destination[description.date.Name + '_dayBoundaries'] = getDayBoundaries(destination[description.date.Name + '_dict'], destination[description.date.Name]);
					datesReady.resolve();
				},
				function() {
					datesReady.reject();
				}				
			);
		}
		// The actual grouping and aggregating should be different per dataset
		var aggregationReady = $q.defer();
		destination.dates_promise.then(
			function() {
				description.aggLoc_perDat_perDay = aggLoc_perDate_perDay(destination[description.date.Name], destination[description.date.Name + '_dayBoundaries'], destination[description.value.Name], description.aggregation);
				aggregationReady.resolve();
			},
			function() {
				aggregationReady.reject();
			}
		);
		allPromises.push(aggregationReady.promise);
		return $q.all(allPromises);
	}
	
	function storeColumns(columnDescription, source, destination) {
		console.log("Reading columns...");
		var maxColLength = 0;
		for (var i = 0; i < columnDescription.length; i++) {
			var column = columnDescription[i];
			destination[column.Name] = jsonPath(source, column.Path);
			maxColLength = Math.max(maxColLength, destination[column.Name].length);
		}
		console.log("Decompressing columns...");
		for (var i = 0; i < columnDescription.length; i++) {
			var columnName = columnDescription[i].Name;
			if (destination[columnName].length !== maxColLength) {
				// Expand the column by replication
				var repeatFactor = maxColLength/destination[columnName].length;
				var toReplicate = destination[columnName];
				destination[columnName] = [];
				for (var j = 0; j<toReplicate.length; j++) {
					for (var k = 0; k<repeatFactor; k++) {
						destination[columnName].push(toReplicate[j]);
					}
				}
			}
		}
	}
	
	function getDayBoundaries(dateDict, dates) {
		console.log('Grouping per day...');
		var result = [];
		var start = 0;
		var currentDay = new Date(dateDict[dates[0]].name);
		for (var i = 0; i<dates.length; i++) {
			var currentDate = new Date(dateDict[dates[i]].name);
			if (!onSameDay(currentDate, currentDay)) {
				result.push({'day': currentDay, 'start': start, 'stop': i});
				currentDay = currentDate;
				start = i;
			}
		}
		result.push({'day': currentDay, 'start': start, 'stop': dates.length});
		return result;
	}
	
	function onSameDay(date1, date2) {
		return (date1.getFullYear() === date2.getFullYear() && date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth());
	}
	
	// OUT: [{day: ?, dates: [], values: []},...]
	function aggLoc_perDate_perDay(dates, dateBoundaries, values, method) {
		if (method==='NONE') return undefined;
		var out = [];
		for (var i = 0; i<dateBoundaries.length; i++) {
			var curDay = dateBoundaries[i];
			var curEl = {'day': curDay.day, 'dates': [], 'values': []};
			
			var curStart = curDay.start;
			var curDate = dates[curStart];
			for (var j = curDay.start; j<curDay.stop; j++) {
				if (dates[j]!==curDate) {
					curEl.dates.push(curDate);
					curEl.values.push(aggregate(range(curStart, j), dates, method));
					curDate = dates[j];
					curStart = j;
				}
			}
			curEl.dates.push(curDate);
			curEl.values.push(aggregate(range(curStart, curDate.stop), dates, method));
			out.push(curEl);
		}
		return out;
	}
	
	function range(start, stop) {
		var out = [];
		for (var i = start; i<stop; i++) {
			out.push(i);
		}
		return out;
	}

	function aggregate(indices, data, method) {
		if (method === 'MEAN'){
			return aggregate(indices, data, 'SUM')*1.0/indices.length;
		} else if (method === 'SUM'){
			var sum = 0;
			for(var i=0; i<indices.length; i++){
				sum += data[indices[i]];
			}
			return sum;
		} else if (method === 'MAX'){
			var max = data[indices[0]];
			for(var i=1; i<indices.length; i++){
				if (data[indices[i]]>max) {
					max = data[indices[i]];
				}
			}
			return max;
		} else if (method === 'MIN'){
			var min = data[indices[0]];
			for(var i=1; i<indices.length; i++){
				if (data[indices[i]]<min) {
					min = data[indices[i]];
				}
			}
			return min;
		} else if (method === 'COUNT'){
			// In case of COUNT, the values are stored in dictionnaries. But no worries, we can use the compressed value to count.
			var counts = {};
			for(var i=0; i<indices.length; i++){
				if (!counts.hasOwnProperty(data[indices[i]])) {
					counts[data[indices[i]]] = 0;
				}
				counts[data[indices[i]]] += 1;
			}
			return counts;
		}
	}

	// Function that loads a url and stores the result in the property field of destination. Returns a promise which is fulfilled when the data is loaded
	function loadUrl(url, destination, field){
		var deferred = $q.defer();
		if (url === undefined || url === '') {
			deferred.resolve();
			return deferred;
		}
		if (!destination.hasOwnProperty(field)) {
			destination[field] = {};
			destination[field + '_promise'] = deferred.promise;
			$http.get(url)
				.success(function(data){
					console.log('Url loaded! ' + url);
					destination[field] = data;
					deferred.resolve();
				})
				.error(function(data){
					console.log('Url load failed! ' + url);
					deferred.reject();
				});
		}
		return destination[field + '_promise'];
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
	// Output is an array with the number of elements equal to the number of data entries on that day.
	this.aggLocPerDatByDay = function(index, date){
		var info = loadedDatasets[index].aggLoc_perDat_perDay;
		if (info === undefined) return undefined;
		for (var i = 0; i<info.length; i++) {
			if (onSameDay(new Date(info[i].day), date)) {
				// In fact, both info[i].dates & info[i].values should be returned to create a good plot...
				return info[i].values;
			}
		}
	};

	/***************** GET DATA FROM SERVICE ********************/

	this.getGroupedAndAggregatedValues = function(index){
		console.log('ERROR: getGroupedAndAggregatedValues not ready yet');
		return groupedAndAggregatedValues[index];
	};

	this.getGroupedValues = function(index){
		console.log('ERROR: getGroupedValues not ready yet');
		return groupedValues[index];
	};

	//return the aggregation parameter selected by the user
	this.getAggregationType = function(index){
		return userDatasets[index].aggregation;
	};

	//a getter for the aggregated values per date
	this.getAggregatedValuesPerDate = function(index){
		console.log('ERROR: getAggregatedValuesPerDate not ready yet');
		return aggregatedValuesPerDate[index];
	};

	//function returning the number of datasets in the service
	this.getNumDatasets = function(){
		return userDatasets.length;
	};

	//return the values: in some cases a dict will be necessary to map numbers to text
	this.getValues = function(index){
		var datasetName = userDatasets[index].name;
		var valuesName = userDatasets[index].value.Name;
		return loadedDatasets[nameToIndex[datasetName]][valuesName];
	};

	//return the valuesTitle:
	this.getValuesTitle = function(index){
		return userDatasets[index].value.Name;
	};

	//return the times: dict will be necessary to convert numbers to real times
	this.getTimes = function(index){
		var datasetName = userDatasets[index].name;
		var timesName = userDatasets[index].date.Name;
		return loadedDatasets[nameToIndex[datasetName]][timesName];
	};

	//returns the locations: dict will be necessary to convert numbers to real locations
	this.getLocations = function(index){
		var datasetName = userDatasets[index].name;
		var locationsName = userDatasets[index].location.Name;
		return loadedDatasets[nameToIndex[datasetName]][locationsName];
	};

	//function returning the valuesDict
	this.getValuesDict = function(index){
		if (userDatasets[index].value.Dict === undefined || userDatasets[index].value.Dict === '') {
			return undefined;
		}
		var datasetName = userDatasets[index].name;
		var dictName = userDatasets[index].value.Name + '_dict';
		return loadedDatasets[nameToIndex[datasetName]][dictName];
	};

	//function returning the timesDict
	this.getTimesDict = function(index){
		if (userDatasets[index].date.Dict === undefined || userDatasets[index].date.Dict === '') {
			return undefined;
		}
		var datasetName = userDatasets[index].name;
		var dictName = userDatasets[index].date.Name + '_dict';
		return loadedDatasets[nameToIndex[datasetName]][dictName];
	};

	//function returning the locationsDict
	this.getLocationsDict = function(index){
		if (userDatasets[index].location.Dict === undefined || userDatasets[index].location.Dict === '') {
			return undefined;
		}
		var datasetName = userDatasets[index].name;
		var dictName = userDatasets[index].location.Name + '_dict';
		return loadedDatasets[nameToIndex[datasetName]][dictName];
	};
}]);