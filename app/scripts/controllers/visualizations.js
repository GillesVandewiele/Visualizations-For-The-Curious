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
    $scope.$watch('values', function(){
        console.log($scope.values);
    });

  }]);
