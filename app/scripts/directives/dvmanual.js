'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directive:dvManual
 * @description
 * # dvManual
 */
angular.module('dataVisualizationsApp.directives')
  .directive('dvManual', function () {
    return {
      templateUrl: '/views/dvmanual.html',
      restrict: 'E'
    };
  });