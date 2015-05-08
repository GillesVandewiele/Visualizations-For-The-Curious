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
    $scope.locationsType = 0;

    //always start with currentTime at zero
    $scope.currentTime = 0;

    $scope.heatMap = ['#00ff00', '#66ff33', '#99ff33', '#ccff33', '#ffff00', '#ffcc00','#ff9933','#ff6600', '#ff3300', '#ff0000'];
    $scope.heatMapBoundaries = ["","","","","","","","","","",""];  

    $scope.mappaths = {};

    $scope.numDatasets = dataService.getNumDatasets();

    $scope.values = [];
    $scope.valuesTitles = [];
    $scope.times = [];
    $scope.locations = [];
    $scope.aggregatedValues = [];
    $scope.groupedAndAggregatedValues = [];

    $scope.locations2Visualize = {};
    var maxLocations2Visualize = 5; // value from 1->7
    $scope.lastAddedLocation2Visualize = maxLocations2Visualize-1;

    $scope.valuesDict = [];
    $scope.timesDict = [];
    $scope.locationsDict = [];

    $scope.calendarData = [];
    $scope.lineChartData = [];
    $scope.barData = [];
    $scope.barDict = [];
    $scope.barSeries= [];
    $scope.barLegend = false;

    for(var c=0;c<$scope.numDatasets;c++){
        $scope.values[c] = dataService.getValues(c);
        $scope.valuesTitles[c] = dataService.getValuesTitle(c);
        $scope.times[c] = dataService.getTimes(c);
        $scope.locations[c] = dataService.getLocations(c);
        $scope.valuesDict[c] = dataService.getValuesDict(c);
        $scope.timesDict[c] = dataService.getTimesDict(c);
        $scope.locationsDict[c] = dataService.getLocationsDict(c);
        $scope.aggregatedValues[c] = dataService.getAggregatedValuesPerDate(c);
        $scope.groupedAndAggregatedValues[c] = dataService.getGroupedAndAggregatedValues(c);

        //do some calendar stuff
        var tmp ={};
        var aggregatedVals ={};
        tmp['title'] = $scope.valuesTitles[c];
        tmp['data'] = {};
        for(var cnt = 0; cnt < $scope.values[c].length;cnt++){
            var time = $scope.times[c][cnt];
            var stringTime = $scope.timesDict[c][time].name;
            var secondsTime = Date.parse(stringTime)/1000;
            var val=$scope.values[c][cnt][0];

            // "2014-05-16T06:45:23+00:00"
            // stringTime.substr(0,10)
            // "2014-05-16"
            // aggregate by day
            var stringDay = stringTime.substr(0,10);
            var dayMilis =  Date.parse(stringDay);
            if(aggregatedVals[dayMilis]){
                aggregatedVals[dayMilis] += val;
            }
            else{
                aggregatedVals[dayMilis] = val;
            }

            tmp['data'][secondsTime] = val;
        }
        var vals = Object.keys(aggregatedVals).map(function(key){ return aggregatedVals[key];});

        tmp['legend'] = getLegend(d3.extent(vals));
        tmp['click'] = clickOnDay;
        $scope.calendarData.push(tmp);
    }

    $scope.firstDate = new Date(2014, 12, 1);

    // Hardcoded date (needs to be replaced by the data when a user clicks the calendar)
    if($scope.aggregatedValues.length > 0)
        $scope.lineChartData = dataService.filterByDay(0, new Date(2015, 0, 30), $scope.aggregatedValues[0], true);

    //check type of locations
    if($scope.locationsDict[0]){
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
        editLocationColors(0);
    }

    //when a location is clicked, we catch this to select the two locations we want to visualize
    //possibility to edit locations2Visualize should also exist in dropdown?
    $scope.$on('leafletDirectivePath.click', function(event,args) {
        //console.log(args.modelName);
        var newLocation = true;

        for(var v in $scope.locations2Visualize){
            if($scope.locations2Visualize[v] == args.modelName){
                newLocation = false;
            }
        }

        if(newLocation){
            if($scope.lastAddedLocation2Visualize < (maxLocations2Visualize - 1)){
                $scope.locations2Visualize[$scope.lastAddedLocation2Visualize+1] = args.modelName;
                $scope.lastAddedLocation2Visualize ++;
            } else {
                $scope.locations2Visualize[0] = args.modelName;
                $scope.lastAddedLocation2Visualize = 0;
            }
        }
    });

   
    //watch for editing the map
    $scope.$watch('currentTime', function(){
        if($scope.locationsDict[0]){
            editLocationColors(0); 
        } 
    });

    //watch for editing the stackbardata
    $scope.$watch('lastAddedLocation2Visualize', function(){
        if($scope.groupedAndAggregatedValues[0]){
            if($scope.locations2Visualize[0]){
                editBarDataWithLocations(0);
            } else if($scope.locations[0].length == 0){
                editBarDataWithoutLocations(0);
            }
        } 
    });


    /****************** MAP INITIALISATION *********************/

    //--> should be done in directive

    //this function initialises the leafletmap by centering the map
    //and by selecting the right map on mapbox. 

    $scope.mapdefaults = {
            maxZoom: 14,
            minZoom: 8
    };

    $scope.mapcenter = {
        lat: 50.5,
        lng: 4.303,
        zoom: 8,
    };

    $scope.maplayers = {
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

    /****************** TIMEBAR INITIALISATION *********************/

    //--> should be done in directive

    //initialisation of the timebar
    //if times are correctly loaded, use times to make the timebar
    if($scope.times[0]){
        $scope.minTime = 0; //set the min index of the timebar
        $scope.maxTime = $scope.times[0].length-1; //set the max index of the timebar
        //make a function that translates an index to a string containing the time
        $scope.translateTime = function(currentTime){
            return $scope.timesDict[0][$scope.times[0][currentTime]].name;
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
                
                mapPlayPromise = $interval(mapNextTimestep, 10, $scope.maxTime-$scope.currentTime);
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
        for(var i=0; i<$scope.locationsDict[index].length; i++){
            var msg = "<p>"+$scope.locationsDict[index][i].name+"</p>";

            $scope.mappaths[''+i] = {
                    message: msg,
                    weight: 2,
                    color: '#00ff00',
                    latlngs: [$scope.locationsDict[index][i].lat, $scope.locationsDict[index][i].long],
                    radius: 20000,
                    type: 'circle',
                    clickable: true
                };
        }
    }

    function editMarkers(index){
        //first find the maximal value
        console.log($scope.values[index])
        var extent = d3.extent($scope.values[index][$scope.currentTime]);

        //now that we have min and max, map all values to a color between green and red.
        for(var k=0; k<$scope.values[index][$scope.currentTime].length; k++){
            var temp = Math.floor(($scope.values[index][$scope.currentTime][k]-extent[0])/(extent[1]-extent[0])*($scope.heatMap.length-1));
            $scope.mappaths[''+$scope.locations[index][$scope.currentTime][k]].color = $scope.heatMap[temp];
        }

        //for the legend, the heatmapboudaries must be set.
        for(var j=0; j<$scope.heatMapBoundaries.length; j++){
            $scope.heatMapBoundaries[j] = ((extent[0] + j*(extent[1]-extent[0])/$scope.heatMapBoundaries.length).toFixed(1)).toString();
        }
    }

    function drawRoutes(index){
        for(var i=0; i<$scope.locationsDict[index].length; i++){
            var decoded = polyline.decode($scope.locationsDict[index][i].coordinates);

            var msg = "<p>"+$scope.locationsDict[index][i].name+"</p>";

            $scope.mappaths[''+i] = {
                    weight: 4,
                    opacity: 0.6,
                    color: '#00ff00',
                    latlngs: decoded,
                    message: msg,
                    name: $scope.locationsDict[index][i].name,
                    clickable: true,  
            };
        }
    }

    function editRoutes(index){
        //first find the maximal value
        var extent = d3.extent($scope.values[index][$scope.currentTime]);

        //now that we have min and max, map all values to a color between green and red.
        for(var k=0; k<$scope.values[index][$scope.currentTime].length; k++){
            var temp = Math.floor(($scope.values[index][$scope.currentTime][k]-extent[0])/(extent[1]-extent[0])*($scope.heatMap.length-1));
            $scope.mappaths[''+$scope.locations[index][$scope.currentTime][k]].color = $scope.heatMap[temp];
        }

        //for the legend, the heatmapboudaries must be set.
        for(var j=0; j<$scope.heatMapBoundaries.length; j++){
            $scope.heatMapBoundaries[j] = ((extent[0] + j*(extent[1]-extent[0])/$scope.heatMapBoundaries.length).toFixed(1)).toString();
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
                    legend.push(min+cnt*intervalSize);
                }
            }
        }

        return legend;
    }

    function clickOnDay(date, nb){
        console.log("date = ", date);
        if($scope.aggregatedValues[0].length > 0){
            $scope.lineChartData = dataService.filterByDay(0, date, $scope.aggregatedValues[0], true);
<<<<<<< HEAD
        }
=======
        console.log($scope.lineChartData)
>>>>>>> c35e0629ca4a53d12dbf0d9c60a240b974c64460
    }


    /************* HELPER FUNCTIONS FOR STACKED BAR *************/
    //stacked bar can be used visualized in two ways: 
    /* one of the aggregated data (if there is an aggregation specified)
    /* one of the grouped data (if a grouping is specified)*/
    function editBarDataWithLocations(index){ 
        //last edited location must be chanded in barchart
        console.log($scope.groupedAndAggregatedValues[index]);

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
        $scope.barSeries[$scope.lastAddedLocation2Visualize] = $scope.mappaths[$scope.locations2Visualize[$scope.lastAddedLocation2Visualize]].name;
        $scope.barLegend = true;

        console.log($scope.barSeries);
    }

    function editBarDataWithoutLocations(index){
        //grouped and aggregated values
        console.log($scope.groupedAndAggregatedValues[index]);

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

        console.log($scope.barSeries);
    }

  }]);

