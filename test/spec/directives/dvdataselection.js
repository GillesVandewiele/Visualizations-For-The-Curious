'use strict';

describe('Directive: dvDataSelection', function () {

  // load the directive's module
  beforeEach(module('dataVisualizationsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<dv-data-selection></dv-data-selection>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the dvDataSelection directive');
  }));
});
