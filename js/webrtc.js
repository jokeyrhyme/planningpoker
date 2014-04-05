/*jslint browser:true, indent:2*/
/*global define, require*/ // Require.JS

define([
  'RTCSessionDescription',
  'RTCPeerConnection',
  'RTCIceCandidate',
  'socket'
], function (RTCSessionDescription, RTCPeerConnection, RTCIceCandidate) {
  'use strict';

  var pc, channel, start, cfg, onError, onLocalDescription, setupChannel;

  document.getElementById('local').value = '';

  onError = function (err) {
    window.console.error(err);
  };

  cfg = {
    iceServers: [
      { url: 'stun:stun.l.google.com:19302' },
      { url: 'stun:stun1.l.google.com:19302' },
      { url: 'stun:stun2.l.google.com:19302' },
      { url: 'stun:stun3.l.google.com:19302' },
      { url: 'stun:stun4.l.google.com:19302' }
    ]
  };

  onLocalDescription = function (desc) {
    pc.setLocalDescription(desc, function () {
      var textarea;
      // TODO: need to get this to the server / other peer
      window.console.log(pc.localDescription);
      textarea = document.getElementById('local');
      textarea.value = JSON.stringify({
        sdp: pc.localDescription.sdp
      });
    });
  };

  setupChannel = function () {
    channel.onopen = function () {
      window.console.log('channel open!');
    };
    channel.onmessage = function () {
      window.console.log('channel message!');
    };
  };

  start = function (isInitiator) {
    pc = new RTCPeerConnection(cfg);

    // send any ice candidates to the other peer
    pc.onicecandidate = function (evt) {
      if (evt.candidate) {
        // TODO: need to get this to the other peer
        //window.console.log('candidate', evt.candidate);
      }
    };

    // let the 'negotiationneeded' event trigger offer generation
    pc.onnegotiationneeded = function () {
      pc.createOffer(onLocalDescription, onError);
    };

    // once remote stream arrives, show it in the remote video element
    pc.onaddstream = function (evt) {
      window.console.log('addstream', evt);
    };

    if (isInitiator) {
      // create data channel and setup chat
      channel = pc.createDataChannel("chat");
      setupChannel();
    } else {
      // setup chat on incoming data channel
      pc.ondatachannel = function (evt) {
        channel = evt.channel;
        setupChannel();
      };
    }
  };

  document.getElementById('initiate').addEventListener('click', function (event) {
    if (!pc) {
      start(true);
    }
  });

  document.getElementById('remote').addEventListener('change', function (event) {
    var message;
    if (!pc) {
      start(false);
    }
    window.console.log('change!', event, this);
    try {
      message = JSON.parse(this.value);
    } catch (err) {
      window.console.warn(err);
      message = {};
    }
    if (message.sdp) {
      pc.setRemoteDescription(new RTCSessionDescription(message), function () {
        // if we received an offer, we need to answer
        if (pc.remoteDescription.type === 'offer') {
          pc.createAnswer(onLocalDescription, onError);
        }
      }, onError);
    }
    if (message.candidate) {
      pc.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  }, false);

});
