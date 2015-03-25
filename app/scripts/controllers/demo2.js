'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controllers.controller:Demo2Ctrl
 * @description
 * # Demo2Ctrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('Demo2Ctrl', ['$scope', function ($scope) {
      $scope.title = 'Demo2Ctrl';
      $scope.d3Data = [
        {name: 'Pieter', score:52},
        {name: 'Bruno', score:50},
        {name: 'Karel', score: 87},
        {name: 'Gilles', score: 59}
      ];
  }]);
