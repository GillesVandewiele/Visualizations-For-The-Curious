'use strict';

/**
 * @ngdoc service
 * @name dataVisualizationsApp.modalService
 * @description
 * # modalService
 * Service in the dataVisualizationsApp.
 */
angular.module('dataVisualizationsApp.services')
  .service('modalService', ['$modal', '$http', function ($modal, $http) {

        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: 'views/popup.html'
        };

        var modalOptions = {
            closeButtonText: 'Close',
            actionButtonText: 'OK',
            headerText: 'Proceed?',
            jsonData: 'Perform this action?'
        };

        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(customModalDefaults, customModalOptions);
        };

        this.show = function (customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $modalInstance) {

                    $scope.modalOptions = tempModalOptions;
                    $scope.columns = [];
                    $scope.currentColumn = { name: "", mapping: "", data: "" };
                    $scope.valid = false;
                    $scope.datasetName = "";
                    $scope.datasetPath = "";

                    $scope.addColumnSpanHidden = {
                        'display':"None"
                    };
                    $scope.addColumnSpanShown = {
                        'display':"inline"
                    };
                    $scope.validateColumnSpan;
                    $scope.addColumnSpan = $scope.addColumnSpanHidden;

                    var enableValid = function(){       
                        $scope.valid = true;
                        document.getElementById("validateColumnSpan").className = "glyphicon glyphicon-ok-circle icon-success";
                    };

                    var disableValid = function(){
                        $scope.valid = false;
                        document.getElementById("validateColumnSpan").className = "glyphicon glyphicon-remove-circle icon-danger";
                    };

                    $scope.modalOptions.ok = function (result) {
                        $http.get('data/files.json')
                            .success(function(data, status, headers, config) { 
                                if($scope.datasetName != "" && $scope.datasetPath != "" && $scope.columns.length != 0){ 
                                    var index = data.Files.length;
                                    console.log(data.Files[0].Name);
                                    console.log(data.Files[index]);
                                    var datasetColumns = [];
                                    for(var i = 0; i < $scope.columns.length; i++){
                                        var newCol = {Name: $scope.columns[i].name, Path: $scope.columns[i].mapping};
                                        datasetColumns.push(newCol);
                                    }
                                    var dataset = {Name:$scope.datasetName, Path:$scope.datasetPath, Columns:datasetColumns};
                                    data.Files[index] = dataset;
                                    console.log("data = ", data);
                                    $http.put('data/files.json', data)
                                        .success(function(data, status, headers, config) {
                                            console.log("dit is een test");
                                        })
                                        .error(function(data, status, headers, config){

                                        });
                                }
                            })
                            .error(function(data, status, headers, config){

                            });
                        $modalInstance.close(result);
                    };

                    $scope.modalOptions.close = function (result) {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.$watchGroup(['currentColumn.data', 'currentColumn.name'], function(){
                        if($scope.currentColumn.data != "" && $scope.currentColumn.name != "" && $scope.currentColumn.data != "Wrong mapping!"){
                            enableValid();
                        } else {
                            disableValid();
                        }
                    });

                    $scope.deleteColumn = function(column){
                        if(column != null){
                            $scope.columns.splice($scope.columns.indexOf(column), 1);
                        }
                    };

                    $scope.addColumn = function(){
                        if($scope.valid){
                            var copy = jQuery.extend(true, {}, $scope.currentColumn);
                            $scope.columns.push(copy); 
                            disableValid();
                            $scope.currentColumn.name = ""; $scope.currentColumn.mapping = ""; $scope.currentColumn.data = "";
                        }
                        console.log($scope.columns);
                    };

                    $scope.$watch('valid', function(){
                        if($scope.valid){
                            $scope.addColumnSpan = $scope.addColumnSpanShown;
                        } else{
                            $scope.addColumnSpan = $scope.addColumnSpanHidden;
                        }
                    });

                    $scope.$watch('currentColumn.mapping', function(){
                        var data = jsonPath(JSON.parse(customModalOptions.jsonData), $scope.currentColumn.mapping);
                        if(data){
                            $scope.currentColumn.data = data;
                        } else if($scope.currentColumn.mapping != "") {
                            $scope.currentColumn.data = "Wrong mapping!";
                        }
                    });
                }
            }

            return $modal.open(tempModalDefaults).result;
        };

    }]);