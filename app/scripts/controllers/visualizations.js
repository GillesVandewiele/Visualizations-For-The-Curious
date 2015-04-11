'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controllers.controller:VisualizationsCtrl
 * @description
 * # VisualizationsCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('VisualizationsCtrl', ['$scope', '$q', 'dataService', function ($scope, $q, dataService) {

    //this function initialises the leafletmap by centering the map
    //and by selecting the right map on mapbox.
    function _initMap(){        
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
    }

    _initMap();


    //getting data using promises
    //this code is for testing porposes only,
    //a watch should be used to check wether the data is updated or not
    //after data is succesfully loaded into dataset,
    //should the data be deleted in the service?
    var dataset = [];
    var dataPromise = [];
    dataPromise[0] = dataService.getActualData(0);
    dataPromise[1] = dataService.getActualData(1);

    dataPromise[0]  
        .then(function(data) {
            console.log('Data loaded');
            dataset[0] = data;
            console.log(dataset[0]);

        }, function(error) {
            console.log('Failed to load data...', error);
        });

    dataPromise[1]  
        .then(function(data) {
            console.log('Data loaded');
            dataset[1] = data;
            console.log(dataset[1]);   
        }, function(error) {
            console.log('Failed to load data...', error);
        });

  }]);
