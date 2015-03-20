'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directives.directive:dvDataSelection
 * @description
 * # dvDataSelection
 */
angular.module('dataVisualizationsApp.directives')
  .directive('dvDataSelection', function () {
    return {
      templateUrl: '/views/dvdataselection.html',
      restrict: 'E',
      controller: 'DataselectionCtrl'
    };
  });
