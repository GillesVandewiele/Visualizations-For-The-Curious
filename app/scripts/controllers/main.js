'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
