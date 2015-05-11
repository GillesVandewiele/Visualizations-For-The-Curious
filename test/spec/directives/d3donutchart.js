'use strict';

describe('Directive: d3DonutChart', function () {

  // load the directive's module
  beforeEach(module('dataVisualizationsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<d3-donut-chart></d3-donut-chart>');
    element = $compile(element)(scope);
    //expect(element.text()).toBe('this is the d3DonutChart directive');
  }));
});
