'use strict';

describe('Service: topojsonService', function () {

  // load the service's module
  beforeEach(module('topojson'));

  // instantiate service
  var topojson;
  beforeEach(inject(function (_topojson_) {
    topojson = _topojson_;
  }));

  it('should do something', function () {
    expect(!!topojson).toBe(true);
  });

});
