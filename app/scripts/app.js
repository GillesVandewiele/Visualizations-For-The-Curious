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
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'dataVisualizationsApp.controllers',
    'dataVisualizationsApp.directives'
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
        templateUrl: 'views/visualizations.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

angular.module('d3', []);
angular.module('topojson', []);
angular.module('dataVisualizationsApp.controllers', []);
angular.module('dataVisualizationsApp.directives', ['d3','topojson']);