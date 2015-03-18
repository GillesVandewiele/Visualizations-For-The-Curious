'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controllers.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
