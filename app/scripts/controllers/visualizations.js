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

    $scope.values[0] = dataService.getValues(0);
    $scope.times[0] = dataService.getTimes(0);
    $scope.locations[0] = dataService.getLocations(0);
    $scope.valuesDict[0] = dataService.getValuesDict(0);
    $scope.timesDict[0] = dataService.getTimesDict(0);
    $scope.locationsDict[0] = dataService.getLocationsDict(0);


    $scope.accidentsData = {};//locations
    $scope.incidentsData = {};//values
    if($scope.locations[0]){
        for (var calIndex = 0; calIndex < $scope.locations[0].length; calIndex++) {
            var time = $scope.times[0][calIndex];
            var stringTime = $scope.timesDict[0][time].name;
            var secondsTime = Date.parse(stringTime)/1000;
            $scope.accidentsData[secondsTime] = $scope.locations[0][calIndex][0];
        };
    }

    if($scope.values[0]){
        for (var calIndex = 0; calIndex < $scope.values[0].length; calIndex++) {
            var time = $scope.times[0][calIndex];
            var stringTime = $scope.timesDict[0][time].name;
            var secondsTime = Date.parse(stringTime)/1000;
            $scope.incidentsData[secondsTime] = $scope.values[0][calIndex][0];
        };
    }

    $scope.firstDate = new Date(2014, 11, 1);


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
    //wait untill all data has been loaded. but how? => callbacks and $q.all()
    $scope.$watch('valuesDict', function(){
         console.log($scope.valuesDict[0]);
    });

  }]);
