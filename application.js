'use strict';

angular.module('updateNotifierApp', []).controller('AppController', function ($scope, $http, $anchorScroll) {
    $scope.app = localStorage.updateNotifier;
    $scope.subscriptionToAdd ={};

    $scope.addSubscription = function () {
        console.log('addSubscription', $scope.subscriptionToAdd);
        $scope.app.subscriptions.push(new Subscription($scope.subscriptionToAdd.name, $scope.subscriptionToAdd.link, $scope.subscriptionToAdd.idSelector))
    };
});