'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controller:PopupCtrl
 * @description
 * # PopupCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('PopupCtrl', function ($scope) {
    $scope.jsonCodeVisible = true;
    $scope.toggleJSON = function() {
  		console.log("executed toggleJSON");
        $scope.jsonCodeVisible = $scope.jsonCodeVisible === false ? true: false;
    };
  });
