'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directive:d3Bars
 * @description
 * # d3Bars
 */
angular.module('dataVisualizationsApp.directives')
.directive('d3Belgium', ['d3', function(d3) {
  return {
    restrict: 'EA',
    scope: {
      data: '=',
      label: '@',
      onClick: '&'
    },
    link: function(scope, iElement, iAttrs) {
      var svg = d3.select(iElement[0])
          .append('svg')
          .attr('id','belgiummap');

      var states = svg.append('g').attr('id', 'states');

      var _belgium=false;

      // on window resize, re-render d3 canvas
      window.onresize = function() {
        return scope.$apply();
      };
      scope.$watch(function(){
          return angular.element(window)[0].innerWidth;
        }, function(){
          return scope.render();
        }
      );

      // watch for data changes and re-render
      // scope.$watch('data', function(newVals, oldVals) {
      //   return scope.render(newVals);
      // }, true);

      d3.json('data/belgium.json', function(error, belgium) {
        if (error){ 
          return console.error(error); 
        }

        _belgium = belgium;

        scope.render();
      });

      // define render function
      scope.render = function(){

        if(_belgium){

          // remove all previous items before render
          states.selectAll('*').remove();

          // setup variables
          var width, height, max;
          //width = d3.select(iElement[0])[0][0].offsetWidth - 20;
          width = 600;
            // 20 is for margins and can be changed
          height = 500;

          // set the height based on the calculations above
          svg.attr('height', height);

          var subunits = topojson.feature(_belgium, _belgium.objects.subunits);

          // var projection = d3.geo.mercator()
          //     .scale(500)
          //     .translate([width / 2, height / 2]);

          var projection = d3.geo.albers()
            .center([4.8, 50.6])
            .rotate([4.4, 0])
            .parallels([7.1, 51.9])
            .scale(13500)
            .translate([-110,263]);

          var path = d3.geo.path()
              .projection(projection);

          states
            .selectAll("path")
              .data(subunits.features)
            .enter().append("path")
              .attr("d", path);

        }
        
      };
    }
  };
}]);