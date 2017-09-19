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

    this.synchronize = function () {
        console.log("must be saved", JSON.stringify(this));
        localStorage[address] = JSON.stringify(this);
        return true;
    };

    this.addSubscription = function (subscription) {
        var me = this;
        console.log('add sub', subscription);
        if(subscription instanceof Subscription){
            console.log('subscription instanceof Subscription. this: ', this);
            this.subscriptions.push(subscription);
            subscription.checkForUpdates(function () {
                me.synchronize();
            });
        }
    }
}

function Subscription(name, link, idSelector, viewSelector, lastValue) {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.name = name;
    this.link = link;
    this.idSelector = idSelector;
    this.viewSelector = viewSelector;
    this.lastValue = lastValue;
    this.updateCount = 0;

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
            if(!me.lastValue){
                if(results.length > 0){
                    me.lastValue = results[0].innerHTML;
                }
            }
            var updateCountNewValue = 0;
            for (var i = 0; i < results.length; i++) {
                if (results[i].innerHTML === me.lastValue) break;
                updateCountNewValue = i;
            }
            me.updateCount = updateCountNewValue;
cb();        };
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
