/*jslint browser:true, indent:2*/
/*global define, require*/ // Require.JS

define([
  'angular',
  'room'
], function (ng) {
  'use strict';

  var mod;

  mod = ng.module('poker', ['room']);

  mod.service('poker', [
    '$rootScope', 'room',
    function ($rootScope, room) {
      var $scope, stage;

      $scope = $rootScope.$new(true);

      $scope.members = room.members;

      stage = 'picking'; // or 'showing' later
      $scope.stage = function (value) {
        if (value === 'picking' || value === 'showing') {
          stage = value;
        }
        return stage;
      };

      $scope.picks = {};

      $scope.submit = function (value) {
        $scope.picks[room.guid] = value;
        room.send({
          type: 'poker.pick',
          data: value
        });
      };

      room.$on('message', function (event, msg) {
        if (msg.type === 'poker.pick') {
          $scope.picks[msg.from] = msg.data;
        }
      });

      $scope.$watchCollection('members', function () {
        Object.keys($scope.picks).forEach(function (name) {
          delete $scope.picks[name];
        });
      });

      return $scope;
    }
  ]);

  mod.controller('PokerCtrl', [
    '$scope', 'poker',
    function ($scope, poker) {
      $scope.values = [0, 1, 2, 3, 5, 8, 13, 21];
      $scope.pick = $scope.values[0];

      $scope.picks = poker.picks;
      $scope.stage = poker.stage;

      $scope.submit = function () {
        poker.submit($scope.pick);
      };

    }
  ]);

  return mod;

});
