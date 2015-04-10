'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controllers.controller:VisualizationsCtrl
 * @description
 * # VisualizationsCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('VisualizationsCtrl', function ($scope) {
    $scope.amtRows = 2;
    $scope.amtCols = 3;
    $scope.getNumber = function(num) {
    	return Array.apply(null, {length: num}).map(Number.call, Number);
    }

    function _initMap(){
        //center the map on Belgium
        $scope.center = {
            lat: 50.5,
            lng: 4.303,
            zoom: 7
        };
        
        //use our own mapbox map
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
    

  });
