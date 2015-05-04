'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directive:d3StackedBar
 * @description
 * # d3StackedBar
 */
angular.module('dataVisualizationsApp.directives')
  .directive('d3StackedBar', [function(d3Service) {
    return {
        template: '<canvas id="bar" class="chart chart-bar" data="barData" labels="barDict" legend="barLegend" series="barSeries"></canvas>', 
        restrict: 'E',
        scope: {
          config: '='
        },
        link: function(scope, iElement, iAttrs) {
          /*scope.$evalAsync(function() {
              var config = scope.config || {};
              scope.data = config.data;
              scope.dict = config.dict;

              var svg = d3.select(iElement[0])
                  .append('svg')
                  .attr('width', '100%');

              // on window resize, re-render d3 canvas
              window.onresize = function() {
                return scope.$apply();
              };
              scope.$watch(function(){
                  return angular.element(window)[0].innerWidth;
                }, function(){
                  return scope.render(scope.data);
                }
              );

              // watch for data changes and re-render
              scope.$watch('data', function(newVals, oldVals) {                
                console.log('data has changed', newVals);
                console.log(scope.dict);
                return scope.render(newVals);
              }, true);

              // define render function
              scope.render = function(data){
                if(data.length > 0){
                  //assume data = json

                  // remove all previous items before render
                  svg.selectAll('*').remove();

                  var arrayData = []
                  for(var v1 in data){
                    arrayData[v1] = [];
                    for(var v2 in data[0]){
                      arrayData[v1][v2] = data[v1][v2];
                    }
                  }

                  // setup variables
                  var width, height, max;
                  width = d3.select(iElement[0])[0][0].offsetWidth - 20;
                  // 20 is for margins and can be changed
                  height = arrayData[0].length * 35;
                  // 35 = 30(bar height) + 5(margin between bars)
                  // this can also be found dynamically when the data is not static
                  max = d3.max(arrayData, function(d){
                    return d3.max(d);
                  });
                  
                  // set the height based on the calculations above
                  svg.attr('height', height);

                  //create the rectangles for the bar chart
                  svg.selectAll('rect')
                    .data(arrayData[0])
                    .enter()
                      .append('rect')
                      //.on('click', function(d, i){return scope.onClick({item: d});})
                      .attr('height', 30) // height of each bar
                      .attr('width', 0) // initial width of 0 for transition
                      .attr('x', 10) // half of the 20 side margin specified above
                      .attr('y', function(d, i){
                        return i * 35;
                      }) // height + margin between bars
                      .transition()
                        .duration(1000) // time of duration
                        .attr('width', function(d){
                          return Math.round(width*d/max);
                        }); // width based on scale

                  svg.selectAll('text')
                    .data(data[0])
                    .enter()
                      .append('text')
                      .attr('fill', '#fff')
                      .attr('y', function(d, i){return i * 35 + 22;})
                      .attr('x', 15)
                      .text(function(d, i){return scope.dict[i];});
                  }
                };//end of render
              });//end of async eval*/
        }//end of link
    };//end of return
  }]);
