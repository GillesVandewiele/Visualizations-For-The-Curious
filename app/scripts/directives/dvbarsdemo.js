'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directives.directive:dvBarsDemo
 * @description
 * # dvBarsDemo
 */
angular.module('dataVisualizationsApp.directives')
  .directive('dvBarsDemo', function () {
    return {
      templateUrl: '/views/dvbarsdemo.html',
      restrict: 'E'
    };
  });