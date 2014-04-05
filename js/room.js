/*jslint browser:true, indent:2*/
/*global define, require*/ // Require.JS

/*global WebSocket*/ // Web Platform APIs

define([
  'angular',
  'Chance',
  'identicon_canvas'
], function (ng, Chance, render_identicon) {
  'use strict';

  var mod, chance, url;

  url = 'ws://young-wildwood-4158.herokuapp.com';
  chance = new Chance();

  mod = ng.module('room', []);

  mod.factory('room', [
    '$rootScope',
    function ($rootScope) {
      var $scope, ws;

      $scope = $rootScope.$new(true);
      ws = new WebSocket(url);

      $scope.guid = chance.guid();
      $scope.members = [ $scope.guid ];
      $scope.name = '';

      $scope.join = function (name) {
        $scope.name = name;
        $scope.send({
          type: 'join'
        });
        setTimeout(function () {
          $scope.send({ type: 'greetings' });
        }, 1e3);
      };

      $scope.send = function (msg) {
        if (msg && typeof msg === 'object') {
          msg.from = $scope.guid;
          msg.room = $scope.name;
        }
        if (typeof msg !== 'string') {
          msg = JSON.stringify(msg);
        }
        if (ws.readyState !== WebSocket.OPEN) {
          $scope.$on('connected', function () {
            ws.send(msg);
          });
        } else {
          ws.send(msg);
        }
      };

      ws.onopen = function () {
        $scope.$emit('connected');
        $rootScope.$evalAsync('');
      };

      ws.onmessage = function (event) {
        var msg;
        try {
          msg = JSON.parse(event.data);
          if (msg.from && $scope.members.indexOf(msg.from) === -1) {
            $scope.members.push(msg.from);
            $scope.send({ type: 'greetings' });
          }
          $scope.$emit('message', msg);
          $rootScope.$evalAsync('');
        } catch (ignore) {}
      };

      ws.onclose = function () {
        window.console.info('WebSocket connection closed');
      };

      ws.onerror = function (err) {
        window.console.error('WebSocket action failed', err);
      };

      return $scope;
    }
  ]);

  mod.controller('RoomCtrl', [
    '$scope', '$location', 'room',
    function ($scope, $location, room) {
      var name;
      name = $location.hash();
      $scope.room = room;
      $scope.members = room.members;

      $scope.refreshMembers = function () {
        while ($scope.members.length) {
          $scope.members.splice(0, 1);
        }
        $scope.members.push(room.guid);
        room.send({ type: 'greetings' });
      };

      if (!name) {
        name = chance.word({ length: 5 });
        $location.hash(name);
      }
      room.join(name);

      $scope.$watch(function () {
        return $location.hash();
      }, function (result, prev) {
        if (result && result !== prev) {
          room.join(name);
        }
      });
    }
  ]);

  mod.controller('LatestMessagesCtrl', [
    '$scope', 'room',
    function ($scope, room) {
      $scope.isVisible = false;
      $scope.messages = [];

      $scope.show = function () {
        $scope.isVisible = true;
      };

      $scope.hide = function () {
        $scope.isVisible = false;
      };

      room.$on('message', function (event, message) {
        if ($scope.messages.length > 10) {
          $scope.messages.shift();
        }
        $scope.messages.push(message);
      });
    }
  ]);

  mod.directive('identicon', [
    function () {
      return {
        replace: true,
        scope: {
          identicon: '@'
        },
        template: '<canvas width="64" height="64"></canvas>',
        link: function ($scope, el$) {
          var node, code, size;
          node = el$[0];
          // change the UUID into a negative 32-bit integer
          code = $scope.identicon;
          code = code.replace(/-/g, '');
          code = -1 * parseInt(code, 16);
          code = code % 2.1e9;
          size = node.width;
          render_identicon(node, code, size);
        }
      };
    }
  ]);

  return mod;

});
