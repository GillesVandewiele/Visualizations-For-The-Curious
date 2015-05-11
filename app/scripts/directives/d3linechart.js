'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directive:d3LineChart
 * @description
 * # d3LineChart
 */
angular.module('dataVisualizationsApp.directives')
  .directive('d3LineChart', [function (d3Service) {
    return {
      template: '<div class="linechart" config="config"></div>',
      restrict: 'E',
	  scope: {
	    config: '=',
	  },
      link: function(scope, element, attrs) {
        scope.$evalAsync(function() {
            var config = scope.config || {};

            var svg = d3.select(element[0]).append("svg");

          	scope.$watch('config.data', function(newVals, oldVals) {
                return scope.render(newVals);
          	}, true);

            scope.render = function(data){
            	if(data.length > 0){
		            console.log("we're in the linechart directive atm!");

                  	// remove all previous items before render
                  	svg.selectAll('*').remove();

                  	// Sort the data on date
		            //data.sort(function(a, b){return a.date - b.date;});

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
					svg.attr("width", width + margin.left + margin.right)
					    .attr("height", height + margin.top + margin.bottom)
					  .append("g")
					    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					// Our line in the linechart
					var line = d3.svg.line()
					    .x(function(d) { return x(d.date); })
					    .y(function(d) { return y(d.data); });

	                // Domain of x and y
		            x.domain(d3.extent(data, function(d) { return d.date; }));
		  			y.domain(d3.extent(data, function(d) { return d.data; }));

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
				        .attr("y", margin.top)
				        .attr("text-anchor", "middle")  
				        .style("font-size", "16px") 
				        .style("color", "black")
				        .text(getDateFormat(data[0].date));

	 				// Drawing our line
				    svg.append("path")
				    	.datum(data)
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
					        i = bisectDate(data, x0, 1),
					        d0 = data[i - 1],
					        d1 = data[i],
					        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
					    focus.attr("transform", "translate(" + x(d.date) + "," + y(d.data) + ")");
					    focus.select("text").text(getTimeFormat(d.date) + " ; " + Number((d.data)).toFixed(2));
				    	});		
				}//end of if
			};//end of render
        });//end of evalAsync
      }//end of link
    };//end of return
 }]);
