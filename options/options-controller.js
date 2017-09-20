'use strict';


var updateNotifierApp = angular.module('updateNotifierApp', []);

var personController = updateNotifierApp.controller('personController', function ($scope) {
    $scope.app = new UpdateNotifier();
    $scope.subscriptionToAdd = {};
    $scope.synchronized = true;

    $scope.addSubscription = function () {
        console.log('addSubscription', $scope.subscriptionToAdd);
        if($scope.subscriptionToAdd.createdAt){
            $scope.app.addSubscription($scope.subscriptionToAdd);
        }else{
            $scope.app.addSubscription(new Subscription($scope.subscriptionToAdd.name, $scope.subscriptionToAdd.link, $scope.subscriptionToAdd.idSelector));
        }

        $scope.subscriptionToAdd = {};
        //$scope.synchronized = false;
        $scope.app.synchronize();
    };

    $scope.synchronizeSubscriptions = function () {
        $scope.synchronized = $scope.app.synchronize();
    };

    $scope.removeSubscription = function (index) {
        $scope.app.trash = $scope.app.subscriptions.splice(index, 1).concat($scope.app.trash.splice(0, 9));
        //$scope.synchronized = false;
        $scope.app.synchronize();
    };

    $scope.editSubscription = function (index) {
        console.log("editSubscription. index: ", index);
        $scope.subscriptionToAdd = $scope.app.subscriptions.splice(index, 1)[0];
        //$scope.synchronized = false;
        $scope.app.synchronize();
    };

    $scope.resetSubscription = function (index) {
        $scope.app.subscriptions[index].lastValue = undefined;
        $scope.app.subscriptions[index].checkForUpdates(function () {
            $scope.app.synchronize();
        });
        //$scope.synchronized = false;
    };

});

console.log("controller", personController);
