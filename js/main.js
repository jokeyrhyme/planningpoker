/*jslint indent:2*/
/*global define, require*/ // Require.JS

require.config({
  baseUrl: 'js',
  paths: {
    angular: '../bower_components/angular/angular.min',
    Chance: '../bower_components/chance/chance',
    qrcode: '../bower_components/qrcodejs/qrcode'
  },
  shim: {
    angular: {
      exports: 'angular'
    },
    qrcode: {
      exports: 'QRCode'
    }
  },
  enforceDefine: true
});

require(['app']);
