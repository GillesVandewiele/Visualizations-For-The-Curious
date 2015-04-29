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


    // if locations are locations = 0 are routes = 1
    /*
    if locations --> cities = points on a map, can be represented with markers
    if locations --> routes = lines on a map, can be represented with polylines
    */ 
    $scope.heatMap = ['#00ff00', '#66ff33', '#99ff33', '#ccff33', '#ffff00', '#ffcc00','#ff9933','#ff6600', '#ff3300', '#ff0000'];
    $scope.heatMapBoundaries = ["","","","","","","","","","",""];  
    var locationsType = 0;

    $scope.cities = {};
    $scope.routes = {};

    $scope.numDatasets = dataService.getNumDatasets();

    $scope.values = [];
    $scope.valuesTitles = [];
    $scope.times = [];
    $scope.locations = [];

    $scope.valuesDict = [];
    $scope.timesDict = [];
    $scope.locationsDict = [];

    $scope.calendarData = [];

    for(var c=0;c<$scope.numDatasets;c++){
        $scope.values[c] = dataService.getValues(c);
        $scope.valuesTitles[c] = dataService.getValuesTitle(c);
        $scope.times[c] = dataService.getTimes(c);
        $scope.locations[c] = dataService.getLocations(c);
        $scope.valuesDict[c] = dataService.getValuesDict(c);
        $scope.timesDict[c] = dataService.getTimesDict(c);
        $scope.locationsDict[c] = dataService.getLocationsDict(c);

        var tmp ={};
        tmp['title'] = $scope.valuesTitles[c];
        tmp['data'] = {};
        for(var cnt = 0; cnt < $scope.values[c].length;cnt++){
            var time = $scope.times[c][cnt];
            var stringTime = $scope.timesDict[c][time].name;
            var secondsTime = Date.parse(stringTime)/1000;
            tmp['data'][secondsTime] = $scope.values[c][cnt][0];
        }

        $scope.calendarData.push(tmp);
    }

    $scope.firstDate = new Date(2014, 10, 1);


    /****************** MAP INITIALISATION *********************/

    //this function initialises the leafletmap by centering the map
    //and by selecting the right map on mapbox.  
    $scope.defaults = {
        maxZoom: 14,
        minZoom: 8
    }

    $scope.center = {
        lat: 50.5,
        lng: 4.303,
        zoom: 8,
    };

    $scope.layers = {
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

    if($scope.times[0]){
        $scope.minTime = 0;
        $scope.maxTime = $scope.times[0].length-1;
        $scope.translateTime = function(currentTime){
            return $scope.timesDict[0][$scope.times[0][currentTime]].name;
        };
    } else {
        $scope.minTime = 0;
        $scope.maxTime = 10000;
        $scope.translateTime = function(currentTime){
            return "no time loaded";
        };
    }

    $scope.currentTime= 0;

    //check type of locations
    if($scope.locationsDict[0]){
        if($scope.locationsDict[0][0].start){
            locationsType = 1;
        }
    }

    //loading the routes or the locations
    drawLocations(0);
    editLocationColors(0);

    //if data has been loaded, visualise (use a watch function)
    //wait untill all data has been loaded. but how? => callbacks and $q.all()
    
    //watch for editing the map
    $scope.$watch('currentTime', function(){
        editLocationColors(0);  
    });

    /************* BUTTON CLICKS *************/
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


    /************* HELPER FUCNTIONS FOR MAP *************/

    function drawLocations(index){
        if( locationsType == 0){
            //okay, this means we are considering cities!
            drawMarkers();
        } else if(locationsType == 1){
            //okay, this means we are considering routes!
            drawRoutes(index);
        }
    }

    function editLocationColors(index){
        if( locationsType == 0){
            editMarkers(index);
        } else if(locationsType == 1){
            editRoutes(index);
        }
    }

    function drawMarkers(){

    }

    function editMarkers(){

    }

    function drawRoutes(index){
        for(var i=0; i<$scope.locationsDict[index].length; i++){
            var decoded = polyline.decode($scope.locationsDict[index][i].coordinates);

            var msg = "<p>"+$scope.locationsDict[index][i].name+"</p>";

            $scope.routes['route_'+i] = {
                    weight: 3,
                    opacity: 0.6,
                    color: '#00ff00',
                    latlngs: decoded,
                    message: msg,
                    name: $scope.locationsDict[index][i].name
            };
        }
    }

    function editRoutes(index){
        //first find the maximal value
        var extent = d3.extent($scope.values[index][$scope.currentTime]);

        //now that we have min and max, map all values to a color between green and red.
        for(var k=0; k<$scope.values[index][$scope.currentTime].length; k++){
            var temp = Math.floor(($scope.values[index][$scope.currentTime][k]-extent[0])/(extent[1]-extent[0])*($scope.heatMap.length-1));
            $scope.routes['route_'+$scope.locations[index][$scope.currentTime][k]].color = $scope.heatMap[temp];
        }

        //for the legend, the heatmapboudaries must be set.
        for(var j=0; j<$scope.heatMapBoundaries.length; j++){
            $scope.heatMapBoundaries[j] = (Math.floor(extent[0] + j*(extent[1]-extent[0])/$scope.heatMapBoundaries.length)).toString();
        }
    }

    function mapNextTimestep(){
        $scope.currentTime++;
    }

  }]);
