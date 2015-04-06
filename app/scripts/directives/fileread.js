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

                    var modalOptions = {
                        closeButtonText: 'Cancel',
                        actionButtonText: 'Add file',
                        headerText: 'Add new file: ' + changeEvent.target.files[0].name,
                        jsonData: JSON.stringify(jsonObject, null, 2)
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