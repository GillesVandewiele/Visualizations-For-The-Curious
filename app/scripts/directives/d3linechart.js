'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directive:d3LineChart
 * @description
 * # d3LineChart
 */
angular.module('dataVisualizationsApp')
  .directive('d3LineChart', function () {
    return {
      template: '<div class="linechart" config="config"></div>',
      restrict: 'E',
	  scope: {
	    config: '='
	  },
      link: function postLink(scope, element, attrs) {
        scope.$evalAsync(function() {
            var config = scope.config || {};
            console.log("we're in the linechart directive atm!", config.data);

            var margin = {top: 20, right: 20, bottom: 30, left: 50}, width = 960 - margin.left - margin.right, 
            	height = 500 - margin.top - margin.bottom;
			var x = d3.time.scale().range([0, width]);
			var y = d3.scale.linear().range([height, 0]);
			var xAxis = d3.svg.axis()
				.scale(x)
			    .orient("bottom");
			var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left");
			var svg = d3.select(element[0]).append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var line = d3.svg.line()
			    .x(function(d) { return x(100); })
			    .y(function(d) { return y(d.data); });

            x.domain(d3.extent(config.data, function(d) { return 10; }));
  			y.domain(d3.extent(config.data, function(d) { return d.data; }));

		    svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis)
		    .append("text")
		      .attr("x", width)
		      .style("text-anchor", "end")
		      .text("Time");

		    svg.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Value");

		    svg.append("path")
		    	.datum(config.data)
			    .attr("class", "line")
			    .attr("d", line);
        });
      }
    };
  });
