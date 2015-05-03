'use strict';

describe('Directive: d3LineChart', function () {

  // load the directive's module
  beforeEach(module('dataVisualizationsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<d3-line-chart></d3-line-chart>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the d3LineChart directive');
  }));
});
