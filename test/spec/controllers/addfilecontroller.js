'use strict';

describe('Controller: AddfilecontrollerCtrl', function () {

  // load the controller's module
  beforeEach(module('dataVisualizationsApp'));

  var AddfilecontrollerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddfilecontrollerCtrl = $controller('AddfilecontrollerCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
