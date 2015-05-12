'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directives.directive:d3DonutChart
 * @description
 * # d3DonutChart
 */
angular.module('dataVisualizationsApp.directives')
  .directive('d3DonutChart', [function() {
    return {
      restrict: 'E',
      scope: { 
        values: '=',
        labels: '=',
        donutcolors: '='
      },
      link: function (scope, el, attr){
        //var color = d3.scale.category10();
        // var color = scope.donutcolors || [];
        // if(color.length == 0){
        //   var colorgenerator = d3.scale.category10();
        //   //generate 10 colors
        //   for(i=0;i<10;i++){
        //     color[i]=colorgenerator(i);
        //   }
        // }
        var values = scope.values || [];
        //var color = d3.scale.linear().domain([0,values.length]).range(["green","red"]).clamp(true);

        var color = d3.scale.category20();
        var labels = scope.labels || [];
        var width = 300;
        var height = 300;
        var min = Math.min(width, height);
        var rootelem = d3.select(el[0]);
        var svg = rootelem.append('svg');
        var pie = d3.layout.pie().sort(null);
        var legend = rootelem.append('div').attr('class', 'donut-legend');


        var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.value; });
        
        pie.value(function(d){ return d; });
        svg.call(tip);

        var arc = d3.svg.arc()
          .outerRadius(min / 2 * 0.9)
          .innerRadius(min / 2 * 0.5);
    
        svg.attr({width: width, height: height});
        var g = svg.append('g')
          // center the donut chart
          .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        var arcs = g.selectAll('path');
        console.log(arcs);

        var legendEntries = legend.selectAll('div');
        console.log(legendEntries);

        scope.$watch('values', function(values){
          arcs = arcs.data(pie(values));
          arcs.exit().remove(); // remove path tags that no longer have values
          arcs.enter().append('path') // or add path tags if there's more values
            .style('stroke', 'white')
            .attr('fill', function(d, i){ return color(i) })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
          arcs.attr('d', arc); // update all the `<path>` tags
        }, true);

        scope.$watch('labels', function(labels){
          legendEntries = legendEntries.data(labels);
          legendEntries.exit().remove(); // remove div tags that no longer have values
          var entries = legendEntries.enter().append('div').attr('class','legend-entry'); // or add div tags if there's more values
          entries.append('div').attr('class','colorDiv').style('background-color',function(d,i){ return color(i);});
          entries.append('span').text(function(d){ 
            return d;
          });
        }, true);



      }
    };
  }]);