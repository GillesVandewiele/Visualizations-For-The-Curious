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
        return new Array(num);   
    }
  });
