'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directives.directive:d3Calendar
 * @description
 * # d3Calendar
 */
angular.module('dataVisualizationsApp.directives')
  .directive('d3Calendar', [function() {
    return {
        template: '<div class="cal-heatmap" config="config"></div>',
        restrict: 'E',
        scope: {
          config: '='
        },
        link: function(scope, iElement, iAttrs) {
            //$evalAsync makes sure that the templating engine has finished the batch of DOM manipulations for this element
            //f.e. element id: id="theElementId{{$index}}" is parsed to id="theElementId0" and id="theElementId1" in an ng-repeat
            //Took me a while to figure out why the events weren't binding to the buttons
            scope.$evalAsync(function() {
                var config = scope.config || {};
                var nxt = iAttrs.nxt || false;
                var prv = iAttrs.prv || false;
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
                    itemName: 'item',
                    nextSelector: nxt,
                    previousSelector: prv
                };
                angular.extend(defaults, config);
                cal.init(defaults);
            });
        }
    };
  }]);
