/*jslint browser:true, indent:2*/
/*global define, require*/ // Require.JS

define(function () {
  'use strict';

  return window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
});
