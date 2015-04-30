'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directives.directive:d3Belgium
 * @description
 * # d3Belgium
 */
angular.module('dataVisualizationsApp.directives')
.directive('d3Belgium', ['topojsonService', function(topojsonService) {
  return {
    restrict: 'EA',
    scope: {},
    link: function(scope, iElement, iAttrs) {
        topojsonService.then(function(topojson){



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

              var belgianBorders = {
                'lon':[2.2,6.9],
                'lat':[49.2,51.8]
              };
              belgianBorders['center'] = [d3.mean(belgianBorders['lon']),d3.mean(belgianBorders['lat'])];

              var theFeatures = topojson.feature(_belgium, _belgium.objects.subunits);
              var innerBorders = topojson.mesh(_belgium, _belgium.objects.subunits, function(a, b) { return a !== b; });
              var outerBorders = topojson.mesh(_belgium, _belgium.objects.subunits, function(a, b) { return a === b; });
              var places = topojson.feature(_belgium, _belgium.objects.places);

              //see http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
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
              var b = path.bounds(theFeatures);

              b.s = b[0][1]; 
              b.n = b[1][1]; 
              b.w = b[0][0]; 
              b.e = b[1][0]; 
              b.height = Math.abs(b.n - b.s); 
              b.width = Math.abs(b.e - b.w); 
              var s = 0.9 / Math.max(b.width / width, (b.height / maxHeight));
              var t = [(width - s * (b.e + b.w)) / 2, (maxHeight - s * (b.s + b.n)) / 2];

              // Update the projection to use computed scale & translate.
              projection
                  .scale(s)
                  .translate(t);


              //see http://bost.ocks.org/mike/map/
              //Displaying and styling the Polygons
              states
                .selectAll('.subunit')
                  .data(theFeatures.features)
                .enter().append('path')
                .attr('class', function(d) { return 'subunit ' + d.id; })
                .attr('d', path);

              //Displaying Boundaries
              states
                .append('path')
                .datum(innerBorders)
                .attr('class', 'subunit-boundary interior')
                .attr('d', path);

              states
                .append('path')
                .datum(outerBorders)
                .attr('class', 'subunit-boundary exterior')
                .attr('d', path);

              //Add the place locations. This will draw a small circle for each city
              //We can adjust the radius by setting path.pointRadius, and assign styles via CSS
              states
                .append('path')
                .datum(places)
                .attr('class', 'place')
                .attr('d', path);

              //adding the place names
              states
                .selectAll('.place-label')
                  .data(places.features)
                .enter().append('text')
                  .attr('class', 'place-label')
                  .attr('transform', function(d) { return 'translate(' + projection(d.geometry.coordinates) + ')'; })
                  .attr('dy', '.35em')
                  .text(function(d) { return d.properties.name; });

              //Aligning the place names
              var placeNameMargin = 10;

              states
                .selectAll('.place-label')
                  .attr('x', function(d) { 
                    return d.geometry.coordinates[0] > belgianBorders['center'][0] ? placeNameMargin : -placeNameMargin; 
                  })
                  .style('text-anchor', function(d) { return d.geometry.coordinates[0] > belgianBorders['center'][0] ? 'start' : 'end'; });

              states
                .selectAll('.subunit-label')
                  .data(theFeatures.features)
                .enter().append('text')
                  .attr('class', function(d) { return 'subunit-label ' + d.id; })
                  .attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; })
                  .attr('dy', '.35em')
                  .text(function(d) { return d.properties.name; });

            }//end of if
            
          };//end of render
      });//end of then
    }//end of link
  };
}]);