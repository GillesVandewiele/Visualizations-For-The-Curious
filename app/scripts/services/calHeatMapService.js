'use strict';

/**
 * @ngdoc provider
 * @name d3.d3
 * @description
 * # d3
 * Provider in the calHeatMap module.
 */
angular.module('d3')
  .provider('calHeatMapService',function(){
        function createScript($document, callback) {
            var scriptTag = $document.createElement('script');
            scriptTag.type = "text/javascript";
            scriptTag.async = true;
            scriptTag.src = 'scripts/vendor/cal-heatmap.min.js';
            scriptTag.onreadystatechange = function() {
                if (this.readyState == 'complete') {
                    callback();
                }
            }
            scriptTag.onload = callback;
            $document.getElementsByTagName('body')[0].appendChild(scriptTag);
        }

        this.$get = ['$document','$q', '$window', '$rootScope',
            function($document, $q, $window, $rootScope) {
                var deferred = $q.defer();
                createScript($document[0], function() {
                    $rootScope.$apply(function()  { deferred.resolve($window.CalHeatMap) });;
                });
                return deferred.promise;
            }]; 
  });
