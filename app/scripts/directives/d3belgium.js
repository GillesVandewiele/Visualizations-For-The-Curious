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
          var width, maxHeight;
          width = d3.select(iElement[0])[0][0].offsetWidth - 20;
          // 20 is for margins and can be changed
          
          //set the maxHeight
          maxHeight = 500;

          // set the height based on the calculations above
          svg.attr('height', maxHeight);

          var subunits = topojson.feature(_belgium, _belgium.objects.subunits);

          var zoomfactor = 3;

          // Create a unit projection.
          var projection = d3.geo.albers()
              .scale(1)
              .center([0,0])
              .rotate([0,0])
              .translate([0, 0]);

          // Create a path generator.
          var path = d3.geo.path()
              .projection(projection);

          // Compute the bounds of a feature of interest, then derive scale & translate.
          var b = path.bounds(subunits);

          b.s = b[0][1]; 
          b.n = b[1][1]; 
          b.w = b[0][0]; 
          b.e = b[1][0]; 
          b.height = Math.abs(b.n - b.s); 
          b.width = Math.abs(b.e - b.w); 
          var s = .9 / Math.max(b.width / width, (b.height / maxHeight));
          var t = [(width - s * (b.e + b.w)) / 2, (maxHeight - s * (b.s + b.n)) / 2];

          // Update the projection to use computed scale & translate.
          projection
              .scale(s)
              .translate(t);

          states
            .selectAll('path')
              .data(subunits.features)
            .enter().append('path')
              .attr('d', path);

        }
        
      };
    }
  };
}]);