'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controllers.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
