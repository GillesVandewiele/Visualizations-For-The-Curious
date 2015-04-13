'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controllers.controller:VisualizationsCtrl
 * @description
 * # VisualizationsCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('VisualizationsCtrl', ['$scope', 'dataService', function ($scope, dataService) {

    /********************LOAD DATA**********************/


    $scope.numDatasets = dataService.getNumDatasets();

    $scope.values = [];
    $scope.times = [];
    $scope.locations = [];

    $scope.valuesDict = [];
    $scope.timesDict = [];
    $scope.locationsDict = [];

    var promiseValues = dataService.getValues(0);

    promiseValues
        .then(function(values){
            $scope.values[0] = values;
        });

    var promiseTimes = dataService.getTimes(0);

    promiseTimes
        .then(function(times){
            $scope.times[0] = times;
        });


    var promiseLocations = dataService.getLocations(0);

    promiseLocations
        .then(function(locations){
            $scope.locations[0] = locations;
        });

    var promiseValuesDict = dataService.getValuesDict(0);

    promiseValuesDict
        .then(function(valuesDict){
            $scope.valuesDict[0] = valuesDict;
        });

    var promiseTimesDict = dataService.getTimesDict(0);

    promiseTimesDict
        .then(function(timesDict){
            $scope.timesDict[0] = timesDict;
        });

    var promiseLocationsDict = dataService.getLocationsDict(0);

    promiseLocationsDict
        .then(function(locationsDict){
            $scope.locationsDict[0] = locationsDict;
        });

    /****************** MAP INITIALISATION *********************/

    //this function initialises the leafletmap by centering the map
    //and by selecting the right map on mapbox.  
    $scope.center = {
        lat: 50.5,
        lng: 4.303,
        zoom: 8
    };

    $scope.layers = {
        baselayers: {
            mapbox_terrain: {
                name: 'MapboxTerrain',
                url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                type: 'xyz',
                layerOptions: {
                    apikey: 'pk.eyJ1Ijoia3NlcnJ1eXMiLCJhIjoiZk9JSWRQUSJ9.SvA5S_FzBKsyXVm6xf5lGQ',
                    mapid: 'kserruys.lmilh1gp'
                }
            }
        }
    };

    //if data has been loaded, visualise (use a watch function)
    //wait untill all data has been loaded. but how?
    $scope.$watch('valuesDict', function(){
         console.log($scope.valuesDict[0]);
    });

  }]);
