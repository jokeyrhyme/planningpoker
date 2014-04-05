/*jslint browser:true, indent:2*/
/*global define, require*/ // Require.JS

/*global WebSocket*/ // Web Platform APIs

define(function () {
  'use strict';

  var socket;

  socket = new WebSocket('ws://young-wildwood-4158.herokuapp.com');

  socket.onopen = function () {
    setInterval(function () {
      var random;
      random = Math.random();
      window.console.log('broadcasting: ' + random);
      socket.send(JSON.stringify({
        type: 'random',
        room: location.hash,
        data: random
      }));
    }, 5e3);
    socket.send(JSON.stringify({
      type: 'join',
      room: location.hash
    }));
  };

  socket.onmessage = function (event) {
    var msg;
    msg = JSON.parse(event.data);
    if (msg.type === 'stats') {
      window.console.info(msg.data);
    } else {
      window.console.log(msg.data);
    }
  };

  return socket;
});
