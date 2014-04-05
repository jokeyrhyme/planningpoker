/*jslint indent:2*/
/*global define, require*/ // Require.JS

require.config({
  baseUrl: 'js',
  paths: {
    angular: '../bower_components/angular/angular.min',
    Chance: '../bower_components/chance/chance',
    identicon_canvas: 'vendor/identicon_canvas'
  },
  shim: {
    angular: {
      exports: 'angular'
    },
    identicon_canvas: {
      exports: 'render_identicon'
    }
  },
  enforceDefine: true
});

require(['app']);
