'use strict';


var updateNotifierApp = angular.module('updateNotifierApp', []);

var personController = updateNotifierApp.controller('personController', function ($scope, $timeout) {
    $scope.app = new UpdateNotifier();
    $scope.subscriptionToAdd = {};
    $scope.synchronized = true;
    $scope.viewMode = 1;
    $scope.editingIndex = -1;

    if(localStorage.subscriptionToEditUrl){
        $scope.subscriptionToAdd = {link: localStorage.subscriptionToEditUrl};
        delete localStorage.subscriptionToEditUrl;
    }



    $scope.openOptions = function (andSubscribe) {

        if (andSubscribe) {
            chrome.tabs.getSelected(null, function (tab) {
                localStorage.subscriptionToEditUrl = tab.url;
                chrome.runtime.openOptionsPage();

            });
        }
    };


    $scope.changeView = function (viewId) {
        $scope.viewMode = viewId;
    };

    $scope.addSubscription = function () {
        if ($scope.editingIndex > -1) {
            $scope.app.addSubscription($scope.subscriptionToAdd, $scope.editingIndex);
        } else {
            $scope.app.addSubscription(new Subscription($scope.subscriptionToAdd.name, $scope.subscriptionToAdd.link, $scope.subscriptionToAdd.idSelector, $scope.subscriptionToAdd.interval));
        }
        $scope.editingIndex = -1;
        $scope.subscriptionToAdd = {};
        //$scope.synchronized = false;
        $scope.app.synchronize();
    };

    $scope.synchronizeSubscriptions = function () {
        $scope.synchronized = $scope.app.synchronize();
    };

    $scope.removeSubscription = function (index) {
        $scope.app.trash.splice(0, 0, $scope.app.subscriptions.splice(index, 1)[0]);
        //$scope.synchronized = false;
        $scope.app.synchronize();
    };

    $scope.removeSubscriptionForever = function (index) {
        $scope.app.trash.splice(index, 1);
        $scope.app.synchronize();
    };

    $scope.restoreSubscription = function (index) {
        $scope.app.subscriptions.splice(0, 0, $scope.app.trash.splice(index, 1)[0]);
        //$scope.synchronized = false;
        $scope.app.synchronize();
    };

    $scope.editSubscription = function (index) {
        $scope.editingIndex = index;
        $scope.subscriptionToAdd = $scope.app.subscriptions[index];
        //$scope.synchronized = false;
        $scope.app.synchronize();
    };

    $scope.refreshSubscription = function (index) {
        $scope.app.subscriptions[index].checkForUpdates(function () {
            $timeout();
            $scope.app.synchronize();
        });
    };

    $scope.resetSubscription = function (index) {
        $scope.app.subscriptions[index].lastValue = undefined;
        $scope.app.subscriptions[index].checkForUpdates(function () {
            $scope.app.synchronize();
        });
        //$scope.synchronized = false;
    };
});
