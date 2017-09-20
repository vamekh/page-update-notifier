const address = "updateNotifier";

function UpdateNotifier() {
    var appData = localStorage[address];


    if (appData) {
        appData = JSON.parse(appData);
        this.subscriptions = appData.subscriptions || [];
        this.trash = appData.trash || [];
        this.trashSize = appData.trashSize || 10;
    } else {
        this.subscriptions = [];
        this.trash = [];
        this.trashSize = 10;
    }
    for(var i = 0; i < this.subscriptions.length; i++) this.subscriptions[i] = new Subscription(this.subscriptions[i]);
    for(var j = 0; j < this.trash.length; j++) this.trash[j] = new Subscription(this.trash[j]);

    this.synchronize = function () {
        var totalUpdatesNewValue= 0;
        for(var k = 0; k< this.subscriptions.length; k++){
            totalUpdatesNewValue += this.subscriptions[k].updateCount;
        }
        this.totalUpdates = totalUpdatesNewValue;

        chrome.browserAction.setBadgeText({text: this.totalUpdates ? this.totalUpdates + '' : ''});

        localStorage[address] = JSON.stringify(this);
        return true;
    };

    this.addSubscription = function (subscription) {
        var me = this;
        console.log('add sub', subscription);
        if (subscription instanceof Subscription) {
            console.log('subscription instanceof Subscription. this: ', this);
            this.subscriptions.push(subscription);
            subscription.checkForUpdates(function () {
                me.synchronize();
            });
        }
    }
}

function Subscription(name, link, idSelector, interval, viewSelector, lastValue) {
    if(arguments.length === 1 && arguments[0] instanceof Object){
        this.createdAt = arguments[0].createdAt;
        this.updatedAt = arguments[0].updatedAt;
        this.name = arguments[0].name;
        this.link = arguments[0].link;
        this.idSelector = arguments[0].idSelector;
        this.interval = arguments[0].interval;
        this.viewSelector = arguments[0].viewSelector;
        this.lastValue = arguments[0].lastValue;
        this.updateCount = arguments[0].updateCount;
    }else {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.name = name;
        this.link = link;
        this.idSelector = idSelector;
        this.interval = interval;
        this.viewSelector = viewSelector;
        this.lastValue = lastValue;
        this.updateCount = 0;
    }

}

Subscription.prototype.checkForUpdates = function (cb) {
    var me = this;
    try {
        var req = new XMLHttpRequest();
        req.open('GET', this.link);
        req.onload = function (res) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(res.srcElement.responseText, "text/html");
            var results = doc.querySelectorAll(me.idSelector);
            if (!me.lastValue) {
                if (results.length > 0) {
                    me.lastValue = results[0].innerHTML;
                }
            }
            var updateCountNewValue = 0;
            for (var i = 0; i < results.length; i++) {
                updateCountNewValue = i;
                if (results[i].innerHTML === me.lastValue) {
                    console.log("found new value. i = " + i);
                    break;
                }
            }
            console.log('update >>>>', me.lastValue, results[0].innerHTML);
            me.updateCount = updateCountNewValue;
            cb();
        };
        req.send();
    } catch (e) {

    }
};

/*
Subscription.prototype.initialize = function(cb){
    var parser = new DOMParser();
    var doc = parser.parseFromString(res.srcElement.responseText, "text/html");
    var results = doc.querySelectorAll(this.idSelector);
    if(results.length > 0){
        this.lastValue = results[0].innerHTML;
    }
    this.updateCount = 0;
    cb();
    console.log('results', results);
};*/
