'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directive:dvDataSelection
 * @description
 * # dvDataSelection
 */
angular.module('dataVisualizationsApp')
  .directive('dvDataSelection', function () {
    return {
      templateUrl: '/views/dvdataselection.html',
      restrict: 'E'
    };
  });
