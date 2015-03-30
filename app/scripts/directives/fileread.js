'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directive:fileread
 * @description
 * # fileread
 */
angular.module('dataVisualizationsApp.directives')
  .directive('fileread', ["$http", function ($http) {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                        /*$http.get(scope.fileread)
                        	.success(function(data, status, headers, config) { 
                        		console.log("data = ", data);
                        	})
                        	.error(function(data, status, headers, config) {

                        	});*/
                    	// TODO: pop-up where user can set name and columns
                        console.log("fileread =", scope.fileread);
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);