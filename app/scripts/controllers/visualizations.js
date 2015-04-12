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

    //getting data using promises
    //this code is for testing porposes only,
    //a watch should be used to check wether the data is updated or not
    //after data is succesfully loaded into dataset,
    /*$scope.actualDataLoaded = [];
    $scope.timesDictLoaded = [];
    $scope.locationsDictLoaded = [];

    var datasets = [];

    var promiseDatasets = dataService.getDatasets();

    var actualData = [];
    var timesDict = [];
    var locationsDict = []; 

    var promiseActualData = [];
    var promiseTimesDict = [];
    var promiseLocationsDict = [];*/

    dataService.loadDataInService();

    $scope.numDatasets = dataService.getNumDatasets();



    /*promiseDatasets
        .then(function(data){
            datasets = data;
            console.log(data);           
        })
        .then(function(){
            for(var i=0; i<datasets.length; i++){
                //there is always actualData
                promiseActualData[i] = dataService.getActualData(i);
                promiseActualData[i]  
                    .then(function(data) {
                        console.log('Data loaded');
                        actualData = data;
                        console.log(actualData);
                    });

                //there is always a timesDict
                promiseTimesDict[i] = dataService.getTimesDict(i);
                promiseTimesDict[i]  
                    .then(function(data) {
                        console.log('Data loaded');
                        timesDict = data;
                        console.log(timesDict);
                    });

                //not every dataset has locations!! (Weginfo not)
                //TODO: there must be a check for all existing DICTS
                //These dicts must also be accessable... somehow...
                promiseLocationsDict[i] = dataService.getLocationsDict(i);
                promiseLocationsDict[i]  
                    .then(function(data) {
                        console.log('Data loaded');
                        locationsDict = data;
                        console.log(locationsDict);
                    });
            }
        });*/


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
    //$scope.$watch('', function(){});

  }]);
