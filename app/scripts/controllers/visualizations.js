'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controllers.controller:VisualizationsCtrl
 * @description
 * # VisualizationsCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('VisualizationsCtrl', ['$scope', 'dataService', '$interval', function ($scope, dataService, $interval) {

    /********************LOAD DATA**********************/

    // if locations are locations = 2 , routes = 1 , no locations = 0
    /*
    if locations --> cities = points on a map, can be represented with markers
    if locations --> routes = lines on a map, can be represented with polylines
    if locations --> none = hide map
    */ 

    $scope.showLinechart = true;
    $scope.showBarchart = false;
    $scope.showMultilinechart = false;
    $scope.showPiechart = false;

    $scope.locationsType = 0;

    //always start with currentTime at zero
    $scope.currentTime = 0;

    $scope.heatMap = ['#00ff00', '#66ff33', '#99ff33', '#ccff33', '#ffff00', '#ffcc00','#ff9933','#ff6600', '#ff3300', '#ff0000'];
    $scope.heatMapBoundaries = ["","","","","","","","","","",""];  

    $scope.mapPaths = {};
    $scope.mapExtent = [];
    $scope.mapDefaults = {};
    $scope.mapCenter = {};
    $scope.mapLayers = {};

    $scope.numDatasets = dataService.getNumDatasets();

    $scope.valuesToday = [];
    $scope.valuesTodayAggregated = [];

    $scope.valuesTitles = [];
    $scope.groupedAndAggregatedValues = [];

    $scope.locations2Visualize = [];
    var maxLocations2Visualize = 5; // value from 1->7
    $scope.lastAddedLocation2Visualize = maxLocations2Visualize;

    $scope.valuesDict = [];
    $scope.timesDict = [];
    $scope.locationsDict = [];

    $scope.calendarData = [];
    $scope.lineChartData = [];

    $scope.barData = [];
    $scope.barDict = [];
    $scope.barSeries= [];
    $scope.barLegend = false;

    $scope.multilineData = [];
    $scope.multilineDict = [];
    $scope.multilineSeries= [];
    $scope.multilineLegend = false;

    for(var c=0;c<$scope.numDatasets;c++){
        $scope.valuesTitles[c] = dataService.getValuesTitle(c);
        $scope.valuesDict[c] = dataService.getValuesDict(c);
        $scope.timesDict[c] = dataService.getTimesDict(c);
        $scope.locationsDict[c] = dataService.getLocationsDict(c);
        $scope.groupedAndAggregatedValues[c] = dataService.getGroupedValues(c);


        $scope.valuesTodayAggregated[c] = dataService.getByDay(c, new Date($scope.timesDict[c][Object.keys($scope.timesDict[c])[0]].name), {'date': true, loc: 'no'});
        $scope.valuesToday[c] = dataService.getByDay(c, new Date($scope.timesDict[c][Object.keys($scope.timesDict[c])[0]].name), {'date': true, loc: 'yes'});
       
        var tmp ={};
        tmp['title'] = $scope.valuesTitles[c];
        tmp['data'] = {};
        var vals = [];
        var days = dataService.getDays(c);
        for(var i = 0; i < days.length; i++){
            var value = dataService.getByDay(c, days[i], {'date': false, loc: 'no'});
            tmp['data'][(days[i].getTime()/1000).toString()] = value;
            vals.push(value);
        }
        tmp['legend'] = getLegend(d3.extent(vals));
        tmp['click'] = clickOnDay;
        $scope.calendarData.push(tmp);
    }

    //if data is loaded, set first date of the calender equal the first date in data
    if($scope.timesDict.length > 0){
        $scope.firstDate = new Date($scope.timesDict[0][Object.keys($scope.timesDict[0])[0]].name);
    } else {
        $scope.firstDate = new Date(2015, 0, 30);
    }

    //check type of locations
    if($scope.locationsDict[0]){
        //if locations are available:
        initMap();
        //only the coordinates of a village/city are expressed with .long and .lat
        if($scope.locationsDict[0][0].long){
            $scope.locationsType = 2;
        }
        //only routes have .coordinates as property
        else if($scope.locationsDict[0][0].coordinates){
            $scope.locationsType = 1;
        }
        //if there are no locations
        else {
            $scope.locationsType = 0;
        }
    }

    //loading the routes or the locations
    if($scope.locationsDict[0]){
        drawLocations(0);
    }

    //when a location is clicked, we catch this to select the two locations we want to visualize
    //possibility to edit locations2Visualize should also exist in dropdown?
    $scope.$on('leafletDirectivePath.click', function(event,args) {
        var newLocation = true;

        //only add the clicked locations if it isn't already in the charts.
        if($scope.locations2Visualize.length > 0){
            for(var v=0; v<$scope.locations2Visualize.length; v++){
                if($scope.locations2Visualize[v] == args.modelName){
                    newLocation = false;
                    console.log('This location is already visualized in the charts.')
                }
            }
        }

        
        //the locations2Visualize acts as a FIFO register. the first locations that went in, 
        //will be the first to be thrown out when the maximum number of locations is exceeded
        if(newLocation){
            if($scope.lastAddedLocation2Visualize < maxLocations2Visualize-1){
                $scope.lastAddedLocation2Visualize ++;
                $scope.locations2Visualize[$scope.lastAddedLocation2Visualize] = args.modelName;
            } else {
                $scope.locations2Visualize[0] = args.modelName;
                $scope.lastAddedLocation2Visualize = 0;
            }
        }
    });


    /************************ WATCHES *************************/

    //watch for checking changes in the selected day and updating the linechart accordingly
    $scope.$watch('valuesTodayAggregated', function(){
         if($scope.valuesTodayAggregated.length > 0){
            if($scope.valuesTodayAggregated[0] && $scope.valuesTodayAggregated[0].length > 0){
                $scope.lineChartData = [];
                for(var i = 0; i < $scope.valuesTodayAggregated[0][1].length; i++){
                    $scope.lineChartData.push({date: new Date($scope.timesDict[0][$scope.valuesTodayAggregated[0][0][i]].name), data: $scope.valuesTodayAggregated[0][1][i]});
                }

                $scope.mapStop();
                initTimeBar();
            }
        }
    }, true); //dirty watch!
   
    //watch for editing the map when the timebar has changed
    $scope.$watch('currentTime', function(){
        if($scope.valuesToday.length > 0){   
            if($scope.valuesToday[0]){
                if($scope.locationsDict[0]){
                    editLocationColors(0);
                }
            }
        }
    });

    //watch for editing the map when a new day has been selected
    $scope.$watch('valuesToday', function(){
        if($scope.valuesToday.length > 0){   
            if($scope.valuesToday[0]){
                if($scope.locationsDict[0]){
                    initLegend(0);
                    editLocationColors(0); 

                    if($scope.locations2Visualize.length > 0)
                        editMultilineWithLocations(0); 
                } 
            }
        }
    }, true); //dirty watch!

    //watch for editing the stackbardata
    $scope.$watch('lastAddedLocation2Visualize', function(){
        if($scope.groupedAndAggregatedValues[0]){
            if($scope.locations2Visualize.length > 0){
                editBarDataWithLocations(0);
                editMultilineWithLocations(0); 
            } else if($scope.locationsDict.length == 0){
                editBarDataWithoutLocations(0);
            }
        } 
    }, true); //dirty watch


    /****************** TABS INITIALISATION *********************/


    $("#linechartTab")[0].style.width = '95%';
    $("#linechartTab")[0].style.height = '600px';
    $("#linechartTab")[0].style.position = 'absolute';
    $("#linechartTab")[0].style.top = '10';
    $("#linechartTab")[0].style.left = '2';


    $("#barchartTab")[0].style.width = '95%';
    $("#barchartTab")[0].style.height = '600px';
    $("#barchartTab")[0].style.position = 'absolute';
    $("#barchartTab")[0].style.top = '10';
    $("#barchartTab")[0].style.left = '2';

    $("#multilinechartTab")[0].style.width = '95%';
    $("#multilinechartTab")[0].style.height = '600px';
    $("#multilinechartTab")[0].style.position = 'absolute';
    $("#multilinechartTab")[0].style.top = '10';
    $("#multilinechartTab")[0].style.left = '2';

    $("#piechartTab")[0].style.width = '95%';
    $("#piechartTab")[0].style.height = '600px';
    $("#piechartTab")[0].style.position = 'absolute';
    $("#piechartTab")[0].style.top = '10';
    $("#piechartTab")[0].style.left = '2';

    $("#linechartTab")[0].style.visibility = 'visible';
    $("#barchartTab")[0].style.visibility = 'hidden';
    $("#multilinechartTab")[0].style.visibility = 'hidden';
    $("#piechartTab")[0].style.visibility = 'hidden';


    $("#linechartLink").click(function() {

        $("#linechartTab")[0].style.visibility = 'visible';
        $("#barchartTab")[0].style.visibility = 'hidden';
        $("#multilinechartTab")[0].style.visibility = 'hidden';
        $("#piechartTab")[0].style.visibility = 'hidden';
    });


    $("#barchartLink").click(function() {

        $("#linechartTab")[0].style.visibility = 'hidden';
        $("#barchartTab")[0].style.visibility = 'visible';
        $("#multilinechartTab")[0].style.visibility = 'hidden';
        $("#piechartTab")[0].style.visibility = 'hidden';
            
    });

    $("#multilinechartLink").click(function() {

        $("#linechartTab")[0].style.visibility = 'hidden';
        $("#barchartTab")[0].style.visibility = 'hidden';
        $("#multilinechartTab")[0].style.visibility = 'visible';
        $("#piechartTab")[0].style.visibility = 'hidden';

    });

    $("#piechartLink").click(function() {

        $("#linechartTab")[0].style.visibility = 'hidden';
        $("#barchartTab")[0].style.visibility = 'hidden';
        $("#multilinechartTab")[0].style.visibility = 'hidden';
        $("#piechartTab")[0].style.visibility = 'visible';

    });

    /****************** MAP INITIALISATION *********************/

    //--> should be done in directive

    //this function initialises the leafletmap by centering the map
    //and by selecting the right map on mapbox. 

    function initMap(){
        $scope.mapDefaults = {
                maxZoom: 7,
                minZoom: 7,
                dragging: false,
        };

        $scope.mapCenter = {
            lat: 50.5,
            lng: 4.303,
            zoom: 7,
        };

        $scope.mapLayers = {
            baselayers: {
                mapbox_terrain: {
                    name: 'MapboxTerrain',
                    url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    type: 'xyz',
                    layerOptions: {
                        apikey: 'pk.eyJ1Ijoia3NlcnJ1eXMiLCJhIjoiZk9JSWRQUSJ9.SvA5S_FzBKsyXVm6xf5lGQ',
                        mapid: 'kserruys.lmilh1gp'
                    }
                }
            }
        };
    }

    /****************** TIMEBAR INITIALISATION *********************/

    //--> should be done in directive

    //initialisation of the timebar
    //if times are correctly loaded, use times to make the timebar
    function initTimeBar(){
        if($scope.valuesTodayAggregated[0]){
            $scope.currentTime = 0;
            $scope.minTime = 0; //set the min index of the timebar
            $scope.maxTime = $scope.valuesTodayAggregated[0][0].length-1; //set the max index of the timebar
            //make a function that translates an index to a string containing the time
            $scope.translateTime = function(currentTime){
                return new Date($scope.timesDict[0][$scope.valuesTodayAggregated[0][0][currentTime]].name).toString();
            };
        }
        //if times are not correctly loaded use standard values.
        else {
            $scope.minTime = 0; //set the min index of the timebar
            $scope.maxTime = 10000; //set the max index of the timebar
            //inform the user no times have been loaded.
            $scope.translateTime = function(currentTime){
                return "no time loaded"; 
            };
        }
    }

    /************* TIMEBAR BUTTON CLICKS *************/
    $scope.mapPlayPauseButton = "Play";
    $scope.mapPlaying = false;
    var mapPlayPromise;

    $scope.mapPlayPause = function(){
        if($scope.mapPlaying){
            //pause playing
            if($interval.cancel(mapPlayPromise)){
                //change Pause --> Play
                $scope.mapPlayPauseButton = "Play";
                $scope.mapPlaying = false;
            }
        } else {
            if($scope.currentTime < $scope.maxTime){
                //change Play --> Pause
                $scope.mapPlayPauseButton = "Pause";
                $scope.mapPlaying = true;
                //start playing
                
                mapPlayPromise = $interval(mapNextTimestep, 500, $scope.maxTime-$scope.currentTime);
                mapPlayPromise.then(function(){
                    $scope.mapPlayPauseButton = "Play";
                    $scope.mapPlaying = false;
                });
            }
        }
    };

    $scope.mapStop = function(){
        //stop playing
        if($scope.mapPlaying){
            if($interval.cancel(mapPlayPromise)){
                $scope.mapPlayPauseButton = "Play";
                $scope.mapPlaying = false;
                $scope.currentTime = 0;
            }
        } else {
            $scope.currentTime = 0;
        }

    };

    function mapNextTimestep(){
        $scope.currentTime++;
    }


    /************* HELPER FUNCTIONS FOR MAP *************/

    function drawLocations(index){
        if($scope.locationsType == 2){
            //okay, this means we are considering cities!
            drawMarkers(index);
        } else if($scope.locationsType == 1){
            //okay, this means we are considering routes!
            drawRoutes(index);
        }
    }

    function editLocationColors(index){
        if($scope.locationsType == 2){
            editMarkers(index);
        } else if($scope.locationsType == 1){
            editRoutes(index);
        }
    }

    function drawMarkers(index){
        //variables for determining the center of the map.
        var sumLat = 0;
        var sumLong = 0;

        //drawing all locations
        for(var i=0; i<$scope.locationsDict[index].length; i++){

            $scope.mapPaths[''+i] = {
                    weight: 2,
                    color: '#00ff00',
                    latlngs: [$scope.locationsDict[index][i].lat, $scope.locationsDict[index][i].long],
                    radius: 20000,
                    type: 'circle',
                    clickable: true,
                    name: $scope.locationsDict[index][i].name
                };

            sumLat += $scope.locationsDict[index][i].lat;
            sumLong += $scope.locationsDict[index][i].long;
        }

        //centering the map
        $scope.mapCenter = {
            lat: (sumLat/$scope.locationsDict[index].length),
            lng: (sumLong/$scope.locationsDict[index].length),
            zoom: 7,
        };
    }

    function editMarkers(index){
        //now that we have min and max, map all values to a color between green and red.
        var numberOfMeasurements = $scope.valuesTodayAggregated[index][0].length;
        var numberOfLocations = $scope.valuesToday[index][0].length / numberOfMeasurements;
        for(var k = 0; k < numberOfLocations; k++){
            var temp = Math.floor(($scope.valuesToday[index][2][k+($scope.currentTime*numberOfLocations)]-$scope.mapExtent[0])/($scope.mapExtent[1]-$scope.mapExtent[0])*($scope.heatMap.length-1));
            $scope.mapPaths[$scope.valuesToday[index][1][k+($scope.currentTime*numberOfLocations)]].color = $scope.heatMap[temp];
        }
    }

    function drawRoutes(index){
        //variables for determining the center of the map.
        var sumLat = 0;
        var sumLong = 0;

        //draw all routes
        for(var i=0; i<$scope.locationsDict[index].length; i++){
            var decoded = polyline.decode($scope.locationsDict[index][i].coordinates);

            $scope.mapPaths[''+i] = {
                    weight: 4,
                    opacity: 0.6,
                    color: '#00ff00',
                    latlngs: decoded,
                    name: $scope.locationsDict[index][i].name,
                    clickable: true,  
            };

            //use first coordinate of every routes
            sumLat += decoded[0][0];
            sumLong += decoded[0][1];            
        }

        //centering the map
        $scope.mapCenter = {
            lat: (sumLat/$scope.locationsDict[index].length),
            lng: (sumLong/$scope.locationsDict[index].length),
            zoom: 7,
        };
    }

    function editRoutes(index){   
        var numberOfMeasurements = $scope.valuesTodayAggregated[index][0].length;
        var numberOfLocations = $scope.valuesToday[index][0].length / numberOfMeasurements;
        for(var k = 0; k < numberOfLocations; k++){
            var temp = Math.floor(($scope.valuesToday[index][2][k+($scope.currentTime*numberOfLocations)]-$scope.mapExtent[0])/($scope.mapExtent[1]-$scope.mapExtent[0])*($scope.heatMap.length-1));
            $scope.mapPaths[$scope.valuesToday[index][1][k+($scope.currentTime*numberOfLocations)]].color = $scope.heatMap[temp];
            $scope.mapPaths[$scope.valuesToday[index][1][k+($scope.currentTime*numberOfLocations)]].opacity = 0.1 + $scope.heatMap[temp]/($scope.heatMap.length-1)*0.9;
        }
    }

    function initLegend(index){
        //first find the maximal value
        $scope.mapExtent = [99999, -99999];
        var lMax = -9999999;
        var lMin = 9999999;
        for(var l in $scope.valuesToday[index][2]){
            if($scope.valuesToday[index][2][l] > lMax) lMax = $scope.valuesToday[index][2][l];
            if($scope.valuesToday[index][2][l] < lMin) lMin = $scope.valuesToday[index][2][l];
        }
        if(lMax > $scope.mapExtent[1])
            $scope.mapExtent[1] = lMax;

        if(lMin < $scope.mapExtent[0])
            $scope.mapExtent[0] = lMin;

        //for the legend, the heatmapboudaries must be set.
        for(var j=0; j<$scope.heatMapBoundaries.length; j++){
            $scope.heatMapBoundaries[j] = (($scope.mapExtent[0] + j*($scope.mapExtent[1]-$scope.mapExtent[0])/($scope.heatMapBoundaries.length-1)).toFixed(1)).toString();
        }
    }

    /************* HELPER FUNCTIONS FOR CALENDAR *************/
    function getLegend(extentArray, amountOfThresholds){
        var amountOfThresholds = amountOfThresholds || 5;
        var min;
        var max;
        var legend=[];

        if(extentArray.length == 2){
            if(extentArray[0]<extentArray[1]){
                min = extentArray[0];
                max = extentArray[1];
            }else{
                min = extentArray[1];
                max = extentArray[0];
            }

            var range = Math.floor(max-min);

            amountOfThresholds++;


            if(range > amountOfThresholds){
                var intervalSize =  Math.floor(range/amountOfThresholds);

                for(var cnt = 1; cnt<amountOfThresholds;cnt++){
                    legend.push(Math.round(min+cnt*intervalSize));
                }
            }
        }

        return legend;
    }

    function clickOnDay(date, nb){
        $scope.valuesTodayAggregated[0] = dataService.getByDay(0, date, {'date': true, loc: 'no'});
            //dataService.filterByDay(0, date, $scope.aggregatedValues[0], true);
        $scope.valuesToday[0] = dataService.getByDay(0, date, {'date': true, loc: 'yes'});
            //$scope.valuesToday[0] = dataService.filterByDay(0, date, $scope.values[0], false);
        $scope.$apply();
    }


    /************* HELPER FUNCTIONS FOR STACKED BAR *************/
    //stacked bar can be used visualized in two ways: 
    /* one of the aggregated data (if there is an aggregation specified)
    /* one of the grouped data (if a grouping is specified)*/
    function editBarDataWithLocations(index){ 
        //last edited location must be chanded in barchart
        console.log("Grouped and aggregated values = ", $scope.groupedAndAggregatedValues[index]);

        var tempBarData = [];
        
        var i = 0;
        for(var v in $scope.groupedAndAggregatedValues[index]){
            tempBarData[i] = [];
            if($scope.groupedAndAggregatedValues[index][v][$scope.locations2Visualize[$scope.lastAddedLocation2Visualize]])
                //rounding to one digit
                tempBarData[i] = $scope.groupedAndAggregatedValues[index][v][$scope.locations2Visualize[$scope.lastAddedLocation2Visualize]].toFixed(1);
            else
                tempBarData[i] = 0;
            i++;
        }

        if($scope.barDict.length < 1){
            var tempBarDict = [];
            for(var v in $scope.groupedAndAggregatedValues[index]){
                tempBarDict.push(v);
            }
            $scope.barDict = tempBarDict;
        }

        //one problem remains, ordering of the days is dependent on the first date that is loaded.
        //if first day of a dataset is a Tuesday --> tuesday first... --> fixed by initialising groupedValues correctly
        $scope.barData[$scope.lastAddedLocation2Visualize] = tempBarData;

        //add legend to chart --> apparently leaflet-directive and angular-chart.js conflict when legend is involved...
        //had to disable all legend functionality of angular-leaflet-directive by commenting out
        console.log("locations2visualize = ", $scope.locations2Visualize[$scope.lastAddedLocation2Visualize]);
        $scope.barSeries[$scope.lastAddedLocation2Visualize] = $scope.mapPaths[$scope.locations2Visualize[$scope.lastAddedLocation2Visualize].toString()].name;
        $scope.barLegend = true;
    }

    function editBarDataWithoutLocations(index){
        var tempBarData = [];
        
        var i = 0;
        for(var v in $scope.groupedAndAggregatedValues[index]){
            tempBarData[i] = [];
            if($scope.groupedAndAggregatedValues[index][v])
                //rouding to one digit
                tempBarData[i] = $scope.groupedAndAggregatedValues[index][v].toFixed(1);
            else
                tempBarData[i] = 0;
            i++;
        }

        if($scope.barDict.length < 1){
            var tempBarDict = [];
            for(var v in $scope.groupedAndAggregatedValues[index]){
                tempBarDict.push(v);
            }
            $scope.barDict = tempBarDict;
        }

        //always only 1 series --> index = 0
        $scope.barData[0] = tempBarData;

        //always only 1 series --> index = 0
        $scope.barSeries[0] = $scope.valuesTitles[index];
        $scope.barLegend = true;
    }


    /************* HELPER FUNCTIONS FOR Mutliline Chart *************/

   function editMultilineWithLocations(index){ 
        //last edited location must be chanded in barchart

        //fill the data of the multilinechart
        var tempMultilineData = []

        for(var l=0; l<$scope.locations2Visualize.length; l++){
            tempMultilineData[l] = [];
            for(var v=0; v<$scope.valuesToday[index][0].length; v++){
                tempMultilineData[l][v] = $scope.valuesToday[index][$scope.locations2Visualize[l]][v].data.toFixed(1);
            }
        }

        console.log(tempMultilineData);

        $scope.multilineData = tempMultilineData;

        //fill the dict for the x-axis
        var tempMultilineDict = [];

        for(var v=0; v<$scope.valuesToday[index][0].length; v++){
            if((1+v)%4==0){
                tempMultilineDict[v] = $scope.valuesToday[index][0][v].date.toLocaleTimeString();
            } else {
                tempMultilineDict[v] = "";
            }
        }

        $scope.multilineDict = tempMultilineDict;

        $scope.multilineSeries[$scope.lastAddedLocation2Visualize] = $scope.mapPaths[$scope.locations2Visualize[$scope.lastAddedLocation2Visualize].toString()].name;
        $scope.multilineLegend = true;
    } 

  }]);




