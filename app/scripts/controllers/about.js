'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
