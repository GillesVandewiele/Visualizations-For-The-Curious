'use strict';

describe('Service: modalService', function () {

  // load the service's module
  beforeEach(module('dataVisualizationsApp'));

  // instantiate service
  var modalService;
  beforeEach(inject(function (_modalService_) {
    modalService = _modalService_;
  }));

  it('should do something', function () {
    expect(!!modalService).toBe(true);
  });

});
