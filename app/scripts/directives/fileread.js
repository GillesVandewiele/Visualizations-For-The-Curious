'use strict';

/**
 * @ngdoc directive
 * @name dataVisualizationsApp.directive:fileread
 * @description
 * # fileread
 */
angular.module('dataVisualizationsApp.directives')
  .directive('fileread', ['modalService', function (modalService) {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element) {
            element.bind("change", function (changeEvent) {
                
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    var jsonObject = JSON.parse(reader.result);
                    console.log(JSON.stringify(jsonObject));

                    var modalOptions = {
                        closeButtonText: 'Cancel',
                        actionButtonText: 'Delete Customer',
                        headerText: 'Delete ?',
                        jsonData: JSON.stringify(jsonObject, null, "\n")
                    };

                    modalService.showModal({}, modalOptions);
                }
                if(changeEvent.target.files[0]){
                    reader.readAsText(changeEvent.target.files[0]);
                }
            });
        }
    }
}]);