'use strict';

describe('Directive: d3Calendar', function () {

  // load the directive's module
  beforeEach(module('dataVisualizationsApp.directives'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<d3-calendar></d3-calendar>');
    element = $compile(element)(scope);
    //expect(element.text()).toBe('this is the d3Calendar directive');
  }));
});
