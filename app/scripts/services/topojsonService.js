'use strict';

/**
 * @ngdoc provider
 * @name d3.topojson
 * @description
 * # topojson
 * Provider for topojson.
 */
angular.module('d3')
  .provider('topojsonService',[function(){
        function createScript($document, callback) {
            var scriptTag = $document.createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.src = 'scripts/vendor/topojson.v1.min.js';
            scriptTag.onreadystatechange = function() {
                if (this.readyState === 'complete') {
                    callback();
                }
            };
            scriptTag.onload = callback;
            $document.getElementsByTagName('body')[0].appendChild(scriptTag);
        }
 
        this.$get = ['$document','$q', '$window', '$rootScope',
            function($document, $q, $window, $rootScope) {
                var deferred = $q.defer();
                createScript($document[0], function() {
                    $rootScope.$apply(function()  { deferred.resolve($window.topojson); });
                });
                return deferred.promise;
            }]; 
  }]);
