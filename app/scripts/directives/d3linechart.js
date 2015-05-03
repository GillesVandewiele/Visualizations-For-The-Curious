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
            if(config.data.length > 0){
	            console.log("we're in the linechart directive atm!", config.data);

	            // Declaring the margins
	            var margin = {top: 20, right: 20, bottom: 30, left: 50}, width = 960 - margin.left - margin.right, 
	            	height = 500 - margin.top - margin.bottom;

	            // The reach of x and y 
				var x = d3.time.scale().range([0, width]);
				var y = d3.scale.linear().range([height, 0]);

				// Functions
				var getTimeFormat = d3.time.format("%H:%M");
				var getDateFormat = d3.time.format("%d - %m - %Y");
				var bisectDate = bisectDate = d3.bisector(function(d) { return d.date; }).left;

				// Declaring the x and y axis
				var xAxis = d3.svg.axis()
					.scale(x)
				    .tickFormat(function(d) { return getTimeFormat(d); })
				    .orient("bottom");
				var yAxis = d3.svg.axis()
				    .scale(y)
				    .orient("left");

				// Declaring a svg element to put our visualization in
				var svg = d3.select(element[0]).append("svg")
				    .attr("width", width + margin.left + margin.right)
				    .attr("height", height + margin.top + margin.bottom)
				  .append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				// Our line in the linechart
				var line = d3.svg.line()
				    .x(function(d) { return x(d.date); })
				    .y(function(d) { return y(d.data); });

                // Domain of x and y
	            x.domain(d3.extent(config.data, function(d) { return d.date; }));
	  			y.domain(d3.extent(config.data, function(d) { return d.data; }));

	  			// Drawing x axis
			    svg.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + height + ")")
			      .call(xAxis)
			    .append("text")
			      .attr("x", width)
			      .style("text-anchor", "end")
			      .text("Time");

			    // Drawing y axis
			    svg.append("g")
			      .attr("class", "y axis")
			      .call(yAxis)
			    .append("text")
			      .attr("transform", "rotate(-90)")
			      .attr("y", 6)
			      .attr("dy", ".71em")
			      .style("text-anchor", "end")
			      .text(config.axisTitle);

			    // Our title (the day)
			    svg.append("text")
			        .attr("x", (width / 2))             
			        .attr("y", 0 - (margin.top / 4))
			        .attr("text-anchor", "middle")  
			        .style("font-size", "16px") 
			        .text(getDateFormat(config.data[0].date));

 				// Drawing our line
			    svg.append("path")
			    	.datum(config.data)
				    .attr("class", "line")
				    .attr("d", line);

				// Below are functions for drawing a rectangle when the user hovers over chart 
			    var focus = svg.append("g")
			      .attr("class", "focus")
			      .style("display", "none");

			    focus.append("circle")
			      .attr("r", 4.5);

			    focus.append("text")
			      .attr("x", 9)
			      .attr("dy", ".35em");

			    svg.append("rect")
			      .attr("class", "overlay")
			      .attr("width", width)
			      .attr("height", height)
			      .on("mouseover", function() { focus.style("display", null); })
			      .on("mouseout", function() { focus.style("display", "none"); })
			      .on("mousemove", function(){
			      	var x0 = x.invert(d3.mouse(this)[0]),
				        i = bisectDate(config.data, x0, 1),
				        d0 = config.data[i - 1],
				        d1 = config.data[i],
				        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
				    focus.attr("transform", "translate(" + x(d.date) + "," + y(d.data) + ")");
				    focus.select("text").text(getTimeFormat(d.date) + " ; " + Number((d.data)).toFixed(2));
			      });			
			}
        });
      }
    };
  });
