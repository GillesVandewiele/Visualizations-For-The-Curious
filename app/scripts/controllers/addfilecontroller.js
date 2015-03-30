'use strict';

/**
 * @ngdoc function
 * @name dataVisualizationsApp.controller:AddFileCtrl
 * @description
 * # AddFileCtrl
 * Controller of the dataVisualizationsApp
 */
angular.module('dataVisualizationsApp.controllers')
  .controller('AddFileCtrl', ['$scope', '$location', 'modalService', function ($scope, modalService) {
		$scope.deleteCustomer = function () {

			console.log("test");

	        var modalOptions = {
	            closeButtonText: 'Cancel',
	            actionButtonText: 'Delete Customer',
	            headerText: 'Delete ' + '?',
	            bodyText: 'Are you sure you want to delete this customer?'
	        };

	        modalService.showModal({}, modalOptions);
	    }
}]);
