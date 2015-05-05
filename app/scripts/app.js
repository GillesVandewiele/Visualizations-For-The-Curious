'use strict';

/**
 * @ngdoc overview
 * @name dataVisualizationsApp
 * @description
 * # dataVisualizationsApp
 *
 * Main module of the application.
 */
angular
  .module('dataVisualizationsApp', [
    'ngAnimate',
    'ngCookies',
    'ngStorage',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'dataVisualizationsApp.controllers',
    'dataVisualizationsApp.directives',
    'dataVisualizationsApp.services',
    'ui.bootstrap',
    'leaflet-directive',
    'vr.directives.slider',
    'chart.js',
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/visualizations', {
        templateUrl: 'views/visualizations.html',
        controller: 'VisualizationsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

angular.module('d3', []);
angular.module('dataVisualizationsApp.controllers', []);
angular.module('dataVisualizationsApp.services', []);
angular.module('dataVisualizationsApp.directives', ['d3']);
