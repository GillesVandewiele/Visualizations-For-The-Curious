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
	
	/*************** DECLARE USERSDATASETS **********************/

	// Load multiple datasets at once
	this.addMultipleDatasets = function(ds, callbackSuccess, callbackFail){
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
		userDatasets = [];
		loadedDatasets = [];
		nameToIndex = {};
		console.log('Deleted datasets');
	};

	// Function that loads one user dataset into the memory. Returns a promise which is fulfilled when the dataset is ready.
	function loadDataInto(description, destination){
		var allPromises = [];
		var datesAvailable = [];
		
		if (description.value.Dict !== '' && description.value.Dict !== undefined && description.value.Dict !== null) {
			allPromises.push(loadUrl(description.value.Dict, destination, description.value.Name + '_dict'));
		}
		
		datesAvailable.push(loadUrl(description.date.Dict, destination, description.date.Name + '_dict'));
		
		if (description.location !== null && description.location !== undefined) {
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
				// Here grouping and aggregation
				if (description.grouping!==null && description.grouping!==undefined && description.grouping!=="NONE") {
					var aggMethods = convertAggPeriod(description.grouping);
					aggMethods.aggregation = description.aggregation;
					var locations;
					if (description.location !== null && description.location !== undefined) {
						locations = destination[description.location.Name];
					}
					description.aggregated = userAggregate(destination[description.date.Name], destination[description.date.Name + '_dict'], locations, destination[description.value.Name], aggMethods, description);
				}
				aggregationReady.resolve();
			},
			function() {
				aggregationReady.reject();
			}
		);
		allPromises.push(aggregationReady.promise);
		return $q.all(allPromises);
	}
	
	var groupingTitlesWeekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var groupingTitlesMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	function convertAggPeriod(period) {
		var out = {};
		if (period === 'WEEKDAY') {
			out.trans = function(index) {
				return groupingTitlesWeekday[index];
			};
			out.map = function(date) {
				return date.getDay();
			};
		} else if (period === 'WEEKS') {
			out.trans = function(index) {
				return "Week " + index;
			};
			out.map = function(date) {
				return date.getWeek();
			};
		} else if (period === 'MONTH') {
			out.trans = function(index) {
				return groupingTitlesMonth[index];
			};
			out.map = function(date) {
				return date.getMonth();
			};
		} else if (period === 'YEAR') {
			out.trans = function(index) {
				return index;
			};
			out.map = function(date) {
				return date.getYear();
			};
		}
		return out;
	}
	
	function userAggregate(dates, dateDict, locations, values, aggMethods) {
		if (locations !== undefined) {
			var out = [[], [], []];
			var aggrs = {};
			for (var j = 0; j<dates.length; j++) {
				var curAgg = aggMethods.map(new Date(dateDict[dates[j]].name));
				if (!aggrs.hasOwnProperty(curAgg)) {
					aggrs[curAgg] = {};
				}
				if (!aggrs[curAgg].hasOwnProperty(locations[j])) {
					aggrs[curAgg][locations[j]] = [];
				}
				aggrs[curAgg][locations[j]].push(values[j]);
			}
			for (var attr in aggrs) {
				var cAgg = aggrs[attr];
				for (var loc in cAgg) {
					out[0].push(aggMethods.trans(parseInt(attr)));
					out[1].push(loc);
					out[2].push(aggregate(aggrs[attr][loc], aggMethods.aggregation));		
				}
			}
			return out;
		} else {
			var out = [[], []];
			var aggrs = {};
			for (var j = 0; j<dates.length; j++) {
				var curAgg = aggMethods.map(new Date(dateDict[dates[j]].name));
				if (!aggrs.hasOwnProperty(curAgg)) {
					aggrs[curAgg] = [];
				}
				aggrs[curAgg].push(values[j]);
			}
			for (var attr in aggrs) {
				out[0].push(aggMethods.trans(parseInt(attr)));
				out[1].push(aggregate(aggrs[attr], aggMethods.aggregation));
			}
			return out;			
		}
	}
	
	Date.prototype.getWeek = function() {
		var date = new Date(this.getTime());
		date.setHours(0, 0, 0, 0);
		// Thursday in current week decides the year.
		date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
		// January 4 is always in week 1.
		var week1 = new Date(date.getFullYear(), 0, 4);
		// Adjust to Thursday in week 1 and count number of weeks from date to week1.
		return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
	}
	
	function storeColumns(columnDescription, source, destination) {
		console.log('Reading columns...');
		var maxColLength = 0;
		var i;
		for (i = 0; i < columnDescription.length; i++) {
			var column = columnDescription[i];
			destination[column.Name] = jsonPath(source, column.Path);
			maxColLength = Math.max(maxColLength, destination[column.Name].length);
		}
		console.log('Decompressing columns...');
		for (i = 0; i < columnDescription.length; i++) {
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
		
	function aggregate(data, method) {
		var out;
		if (method === 'MEAN'){
			out = aggregate(data, 'SUM')*1.0/data.length;
		} else if (method === 'SUM'){
			out = 0;
			for(var i=0; i<data.length; i++){
				out += data[i];
			}
		} else if (method === 'MAX'){
			out = data[0];
			for(var j=1; j<data.length; j++){
				if (data[j]>out) {
					out = data[j];
				}
			}
		} else if (method === 'MIN'){
			out = data[0];
			for(var k=1; k<data.length; k++){
				if (data[k]<out) {
					out = data[k];
				}
			}
		} else if (method === 'COUNT'){
			// In case of COUNT, the values are stored in dictionnaries. But no worries, we can use the compressed value to count.
			out = {};
			for(var l=0; l<data.length; l++){
				if (!out.hasOwnProperty(data[l])) {
					out[data[l]] = 0;
				}
				out[data[l]] += 1;
			}
		} else {
			// Avoid falling through this method: in case no method is specified: use the mean
			out = aggregate(data, 'MEAN');
		}
		return Math.round(out*100)/100;
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
	
	this.getByDay = function(index, day, what) {
		// Allow to leave out the what parameter
		if (what === undefined) {
			what = {};
		}
		if (what.date === undefined) {
			what.date = true;
		}
		if (what.loc === undefined) {
			what.loc = 'yes';
		}
		
		var dataset = loadedDatasets[nameToIndex[userDatasets[index].name]];
		var method = userDatasets[index].aggregation;
		var days = dataset[userDatasets[index].date.Name + '_dayBoundaries'];
		var dat = dataset[userDatasets[index].date.Name];
		var val = dataset[userDatasets[index].value.Name];
		
		var lB = (userDatasets[index].location !== null) && (userDatasets[index].location !== undefined);
		var loc;
		if (lB) {
			loc = dataset[userDatasets[index].location.Name];
		}

		// Select data of correct day
		var found = false;
		for (var i = 0; i<days.length; i++) {
			if (onSameDay(days[i].day, day)) {
				found = true;
				dat = dat.slice(days[i].start, days[i].stop);
				if (lB) {
					loc = loc.slice(days[i].start, days[i].stop);
				}
				val = val.slice(days[i].start, days[i].stop);
			}
		}
		if (!found) {
			return undefined;
		}

		// Handle the case when no locations are present (easy)
		if (!lB) {
			if (what.loc !== 'no') {
				return undefined;
			} else {
				if (what.date) {
					return [dat, val];
				} else {
					return aggregate(val, method);
				}
			}
		}
		// There are locations in the dataset
		if (what.loc === 'yes') {
			// Keep the locations
			if (what.date) {
				// Keep locations and date
				return [dat, loc, val];
			} else {
				// Keep locations, but aggregate on date
				var out = [[], []];
				var locations = {};
				for (var j = 0; j<dat.length; j++) {
					if (!locations.hasOwnProperty(loc[j])) {
						locations[loc[j]] = [];
					}
					locations[loc[j]].push(val[j]);
				}
				for (var attr in locations) {
					out[0].push(parseInt(attr));
					out[1].push(aggregate(locations[attr], method));
				}
				return out;
			}
		} else if (what.loc === 'no') {
			// Aggregate on the locations
			if (what.date) {
				// Aggregate over locations, but keep the date
				var out = [[], []];
				var curStart = 0;
				var curDate = dat[0];
				for (var i = 1; i<dat.length; i++) {
					if (dat[i]!==curDate) {
						out[0].push(curDate);
						out[1].push(aggregate(val.slice(curStart, i), method));
						curDate = dat[i];
						curStart = i;
					}
				}
				out[0].push(curDate);
				out[1].push(aggregate(val.slice(curStart, dat.length), method));
				return out;
			} else {
				// Aggregate on both location and date
				return aggregate(val, method);
			}
		} else {
			// Filter on location
			var newDat = [];
			var newVal = [];
			for (var i = 0; i<loc.length; i++) {
				if (loc[i] === what.loc) {
					newDat.push(dat[i]);
					newVal.push(val[i]);
				}
			}
			if (what.date) {
				return [newDat, newVal];
			} else {
				return aggregate(newVal, method);
			}
		}
	}

	// Returns a two dimensional array: [[labels], [values]]
	this.getGroupedValues = function(index, opts){
		if (userDatasets[index].aggregated === null || userDatasets[index].aggregated === undefined) {
			return undefined;
		}
		if (opts === undefined || opts.loc === undefined) {
			opts = {'loc': 'no'}; // For legacy reasons, standard is no
		}
		var aggregatedValues = userDatasets[index].aggregated;
		var lB = (aggregatedValues.length === 3);
		// Handle the case with no locations present
		if (!lB) {
			if (opts.loc!=='no') {
				return undefined;
			} else {
				return aggregatedValues;
			}
		}
		// Handle the case with locations present
		var method = userDatasets[index].aggregation;
		if (opts.loc === 'yes') {
			return aggregatedValues;
		} else if (opts.loc === 'no') {
			// Aggregate over the locations
			var aggregates = {};
			for (var i = 0; i<aggregatedValues[0].length; i++) {
				if (!aggregates.hasOwnProperty(aggregatedValues[0][i])) {
					aggregates[aggregatedValues[0][i]] = [];
				}
				aggregates[aggregatedValues[0][i]].push(aggregatedValues[2][i]);
			}
			var out = [[], []];
			for (var attr in aggregates) {
				out[0].push(attr);
				out[1].push(aggregate(aggregates[attr], method));
			}
			return out;
		} else {
			// Select on location
			var out = [[], []];
			var seachedString = opts.loc.toString();
			for (var i = 0; i<aggregatedValues[0].length; i++) {
				if (aggregatedValues[1][i] === seachedString) {
					out[0].push(aggregatedValues[0][i]);
					out[1].push(aggregatedValues[2][i]);
				}
			}
			return out;
		}
	};
	
	// Returns an array with all days in the dataset
	this.getDays = function(index){
		var datasetName = userDatasets[index].name;
		var daysName = userDatasets[index].date.Name + '_dayBoundaries';
		var days = loadedDatasets[nameToIndex[datasetName]][daysName]
		var out = [];
		for (var i = 0; i<days.length; i++) {
			out.push(days[i].day);
		}
		return out;
	};

	//function returning the number of datasets in the service
	this.getNumDatasets = function(){
		return userDatasets.length;
	};

	//return the valuesTitle:
	this.getValuesTitle = function(index){
		return userDatasets[index].value.Name;
	};

	//function returning the valuesDict
	this.getValuesDict = function(index){
		if (userDatasets[index].value.Dict === null || userDatasets[index].value.Dict === undefined || userDatasets[index].value.Dict === '') {
			return undefined;
		}
		var datasetName = userDatasets[index].name;
		var dictName = userDatasets[index].value.Name + '_dict';
		return loadedDatasets[nameToIndex[datasetName]][dictName];
	};

	//function returning the timesDict
	this.getTimesDict = function(index) {
		var datasetName = userDatasets[index].name;
		var dictName = userDatasets[index].date.Name + '_dict';
		return loadedDatasets[nameToIndex[datasetName]][dictName];
	};

	//function returning the locationsDict
	this.getLocationsDict = function(index){
		if (userDatasets[index].location === null || userDatasets[index].location === undefined || userDatasets[index].location.Dict === null || userDatasets[index].location.Dict === undefined || userDatasets[index].location.Dict === '') {
			return undefined;
		}
		var datasetName = userDatasets[index].name;
		var dictName = userDatasets[index].location.Name + '_dict';
		return loadedDatasets[nameToIndex[datasetName]][dictName];
	};
}]);
