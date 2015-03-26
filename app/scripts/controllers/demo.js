'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controllers.controller:DemoCtrl
 * @description
 * # DemoCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
.controller('DemoCtrl', ['$scope', function($scope){
  $scope.title = 'DemoCtrl';
  $scope.d3Data = [
    	{name: 'Pieter', score:52},
        {name: 'Bruno', score:50},
        {name: 'Karel', score: 87},
        {name: 'Gilles', score: 59}
  ];
  $scope.d3OnClick = function(item){
    alert(item.name);
  };
}]);
