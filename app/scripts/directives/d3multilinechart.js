'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directive:d3MultiLineChart
 * @description
 * # d3MultiLineChart
 */
angular.module('dataVisualizationsApp')
  .directive('d3MultiLineChart', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the d3MultiLineChart directive');
      }
    };
  });
