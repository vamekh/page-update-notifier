'use strict';

var updateNotifierApp = angular.module('updateNotifierApp', []);

var personController = updateNotifierApp.controller('personController', function ($scope, $timeout) {
    $scope.app = new UpdateNotifier();
    $scope.subscriptionToAdd = {};
    $scope.synchronized = true;
    $scope.viewMode = 1;
    $scope.editingIndex = -1;

    if (localStorage.subscriptionToEditUrl) {
        $scope.subscriptionToAdd = {link: localStorage.subscriptionToEditUrl};
        delete localStorage.subscriptionToEditUrl;
    }

    $scope.openOptions = function (andSubscribe) {
        if (andSubscribe) chrome.tabs.getSelected(null, function (tab) {
            localStorage.subscriptionToEditUrl = tab.url;
            chrome.runtime.openOptionsPage();
        });
    };

    $scope.changeView = function (viewId) {
        $scope.viewMode = viewId;
    };

    $scope.addSubscription = function () {
        if ($scope.editingIndex > -1) $scope.app.addSubscription($scope.subscriptionToAdd, $scope.editingIndex);
        else $scope.app.addSubscription(new Subscription($scope.subscriptionToAdd.name, $scope.subscriptionToAdd.link, $scope.subscriptionToAdd.idSelector, $scope.subscriptionToAdd.attribute, $scope.subscriptionToAdd.interval));
        $scope.editingIndex = -1;
        $scope.subscriptionToAdd = {};
        $scope.app.writeToLocalStorage();
    };

    $scope.synchronizeSubscriptions = function () {
        $scope.synchronized = $scope.app.writeToLocalStorage();
    };

    $scope.removeSubscription = function (index) {
        $scope.app.trash.splice(0, 0, $scope.app.subscriptions.splice(index, 1)[0]);
        $scope.app.writeToLocalStorage();
    };

    $scope.removeSubscriptionForever = function (index) {
        $scope.app.trash.splice(index, 1);
        $scope.app.writeToLocalStorage();
    };

    $scope.restoreSubscription = function (index) {
        $scope.app.subscriptions.splice(0, 0, $scope.app.trash.splice(index, 1)[0]);
        $scope.app.writeToLocalStorage();
    };

    $scope.editSubscription = function (index) {
        $scope.editingIndex = index;
        $scope.subscriptionToAdd = $scope.app.subscriptions[index];
        $scope.app.writeToLocalStorage();
    };

    $scope.refreshSubscription = function (index) {
        $scope.app.subscriptions[index].checkForUpdates(function () {
            $timeout();
            $scope.app.writeToLocalStorage();
        });
    };

    $scope.resetSubscription = function (index) {
        $scope.app.subscriptions[index].lastValue = undefined;
        $scope.app.subscriptions[index].checkForUpdates(function () {
            $scope.app.writeToLocalStorage();
        });
    };
});
