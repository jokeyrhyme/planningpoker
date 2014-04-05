/*jslint browser:true, indent:2*/
/*global define, require*/ // Require.JS

define([
  'angular',
  'room',
  'poker'
], function (ng) {
  'use strict';

  var app;

  app = ng.module('app', ['room', 'poker']);

  app.config([
    '$locationProvider',
    function ($locationProvider) {
      $locationProvider.html5Mode(true);
    }
  ]);

  ng.bootstrap(document.documentElement, ['app']);

  return app;

});
