'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controllers.controller:VisualizationsCtrl
 * @description
 * # VisualizationsCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('VisualizationsCtrl', ['$scope', 'dataService', 'd3Service', function ($scope, dataService, d3Service) {

    /********************LOAD DATA**********************/


    // if locations are locations = 0 are routes = 1
    /*
    if locations --> cities = points on a map, can be represented with markers
    if locations --> routes = lines on a map, can be represented with polylines
    */ 
    var heatMap = ['#00ff00', '#66ff33', '#99ff33', '#ccff33', '#ffff00', '#ffcc00','#ff9933','#ff6600', '#ff3300', '#ff0000'];  
    var locationsType = 0;

    $scope.cities = {};
    $scope.routes = {};

    $scope.numDatasets = dataService.getNumDatasets();

    $scope.values = [];
    $scope.times = [];
    $scope.locations = [];

    $scope.valuesDict = [];
    $scope.timesDict = [];
    $scope.locationsDict = [];

    $scope.values[0] = dataService.getValues(0);
    $scope.times[0] = dataService.getTimes(0);
    $scope.locations[0] = dataService.getLocations(0);
    $scope.valuesDict[0] = dataService.getValuesDict(0);
    $scope.timesDict[0] = dataService.getTimesDict(0);
    $scope.locationsDict[0] = dataService.getLocationsDict(0);

    $scope.accidentsData = {};//locations
    $scope.incidentsData = {};//values
    if($scope.locations[0]){
        for (var calIndex = 0; calIndex < $scope.locations[0].length; calIndex++) {
            var time = $scope.times[0][calIndex];
            var stringTime = $scope.timesDict[0][time].name;
            var secondsTime = Date.parse(stringTime)/1000;
            $scope.accidentsData[secondsTime] = $scope.locations[0][calIndex][0];
        };
    }

    if($scope.values[0]){
        for (var calIndex = 0; calIndex < $scope.values[0].length; calIndex++) {
            var time = $scope.times[0][calIndex];
            var stringTime = $scope.timesDict[0][time].name;
            var secondsTime = Date.parse(stringTime)/1000;
            $scope.incidentsData[secondsTime] = $scope.values[0][calIndex][0];
        };
    }

    $scope.firstDate = new Date(2014, 10, 1);





    /****************** MAP INITIALISATION *********************/

    //this function initialises the leafletmap by centering the map
    //and by selecting the right map on mapbox.  
    $scope.center = {
        lat: 50.5,
        lng: 4.303,
        zoom: 8
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


    /*********************************** HELPER FUCNTIONS *****************************************/

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
                    weight: 2,
                    color: '#00ff00',
                    latlngs: decoded,
                    message: msg,
                    name: $scope.locationsDict[index][i].name
            };
        }
    }

    function editRoutes(index){
        //first find the maximal value
        d3Service.then(function(d3){
            var extent = d3.extent($scope.values[index][$scope.currentTime]);
            
            //now that we have min and max, map all values to a color between green and red.
            for(var k=0;k<$scope.values[index][$scope.currentTime].length;k++){
                var temp = Math.floor(($scope.values[index][$scope.currentTime][k]-extent[0])/(extent[1]-extent[0])*(heatMap.length-1));
        
                $scope.routes['route_'+$scope.locations[index][$scope.currentTime][k]].color = heatMap[temp];
            }
        });
    }

  }]);
