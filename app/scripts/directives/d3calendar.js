'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directives.directive:d3Calendar
 * @description
 * # d3Calendar
 */
angular.module('dataVisualizationsApp.directives')
  .directive('d3Calendar', ['d3Service', function(d3Service) {
    return {
        template: '<div class="cal-heatmap" config="config"></div>'
        restrict: 'E',
        scope: {
          config: '='
        },
        link: function(scope, iElement, iAttrs) {
            d3Service.then(function(d3){

                var config = scope.config || {};
                var element = iElement[0];
                var cal = new CalHeatMap(d3);
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
                
            });
        }
    };
  }]);
