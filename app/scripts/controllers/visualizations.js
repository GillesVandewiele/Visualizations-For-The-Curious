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

    function _initMap(){
        
        $scope.center = 
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
  }]);
