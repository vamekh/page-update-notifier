'use strict';

var updateNotifierApp = angular.module('updateNotifierApp', []);

var personController = updateNotifierApp.controller('personController', function ($scope, $timeout) {
    $scope.app = new UpdateNotifier();
    $scope.subscriptionToAdd = {};
    $scope.synchronized = true;
    $scope.viewMode = 1;
    $scope.editingIndex = -1;
    $scope.hostname = undefined;
    $scope.selectedaaa = {};
    $scope.selectorLibrary = {
        'mymarket.ge': [
            {name: 'არა vip განცხადებები', idSelector: 'li.vip-0.shopping-[data-pr-id]', attribute: 'data-pr-id'},
            {name: 'განცხადებები', idSelector: 'li.shopping-[data-pr-id]', attribute: 'data-pr-id'}
        ]
    };

    console.log(localStorage.subscriptionToEditUrl);
    if (localStorage.subscriptionToEditUrl) {

        $scope.subscriptionToAdd = {link: localStorage.subscriptionToEditUrl};
        delete localStorage.subscriptionToEditUrl;
    }

    $scope.openOptions = function (andSubscribe) {
        if (andSubscribe) chrome.tabs.getSelected(null, function (tab) {
            localStorage.subscriptionToEditUrl = tab.url;
        });
        chrome.runtime.openOptionsPage();
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
        $timeout(500);
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

    $scope.selectorChoose = function (selector) {
        console.log('click', $scope.selectedaaa, selector);
        if($scope.selectedaaa){
            $scope.subscriptionToAdd.attribute = selector.attribute;
            $scope.subscriptionToAdd.idSelector = selector.idSelector;
        }
    };

    $scope.getHostname = function () {
        console.log('link changed');
        const link = $scope.subscriptionToAdd.link;
        if (link) {
            try {
                const a = document.createElement("a");
                a.href = $scope.subscriptionToAdd.link;
                $scope.hostname = a.hostname.replace(/.*\.(.*\.[a-z]*)/, '$1');
            } catch (e) {
                $scope.hostname = undefined;

            }
        } else {
            $scope.hostname = undefined;
        }
        return $scope.hostname;
    };

    $scope.editSubscription = function (index) {
        $timeout();
        $scope.editingIndex = index;
        $scope.subscriptionToAdd = $scope.app.subscriptions[index];
        $scope.app.writeToLocalStorage();
    };

    $scope.refreshSubscription = function (s) {
        s.checkForUpdates(function () {
            $timeout(500);
            $scope.app.writeToLocalStorage();
            //s.checking = false;

        });
    };

    $scope.resetSubscription = function (s) {
        s.lastValue = undefined;
        s.checkForUpdates(function () {
            $timeout(500);
            $scope.app.writeToLocalStorage();
        });

    };
});
