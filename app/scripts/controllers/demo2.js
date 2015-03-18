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
        {title: 'Greg', score:12},
        {title: 'Ari', score:43},
        {title: 'Loser', score: 87}
      ];
  }]);
