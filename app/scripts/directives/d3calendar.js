'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directives.directive:d3Calendar
 * @description
 * # d3Calendar
 */
angular.module('dataVisualizationsApp.directives')
  .directive('d3Calendar', ['d3Service','calHeatMapService', function(d3Service,calHeatMapService) {
    return {
        template: '<div class="cal-heatmap" config="config"></div>',
        restrict: 'E',
        scope: {
          config: '='
        },
        link: function(scope, iElement, iAttrs) {
            d3Service.then(function(d3){
                calHeatMapService.then(function(){
                    var config = scope.config || {};
                    var element = iElement[0];
                    var cal = new CalHeatMap();
                    var defaults = {
                        itemSelector: element,
                        domain: 'month',
                        subDomain: 'day',
                        subDomainTextFormat: '%d',
                        data: '',
                        start: new Date(),
                        cellSize: 25,
                        range: 3,
                        domainGutter: 10,
                        legend: [2, 4, 6, 8, 10],
                        itemName: 'item'
                    };
                    angular.extend(defaults, config);
                    cal.init(defaults);
                });//end of then
            });//end of then
        }
    };
  }]);
