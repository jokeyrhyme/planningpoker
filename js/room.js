/*jslint browser:true, indent:2*/
/*global define, require*/ // Require.JS

/*global WebSocket*/ // Web Platform APIs

define([
  'angular',
  'Chance'
], function (ng, Chance) {
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
        setInterval(function () {
          var random;
          random = Math.random();
          $scope.send({
            type: 'random',
            data: random
          });
        }, 5e3);
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

  return mod;

});
