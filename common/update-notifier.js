const address = "updateNotifier";
var port = chrome.extension.connect({name: "Sample Communication"});

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

    for (var i = 0; i < this.subscriptions.length; i++) this.subscriptions[i] = new Subscription(this.subscriptions[i]);
    for (var j = 0; j < this.trash.length; j++) this.trash[j] = new Subscription(this.trash[j]);

    this.synchronize = function () {
        var totalUpdatesNewValue = 0;
        for (var k = 0; k < this.subscriptions.length; k++) {
            totalUpdatesNewValue += this.subscriptions[k].updateCount;
        }
        this.totalUpdates = totalUpdatesNewValue;

        chrome.browserAction.setBadgeText({text: this.totalUpdates ? this.totalUpdates + '' : ''});

        localStorage[address] = JSON.stringify(this);
        //port.postMessage("sync please");
        return true;
    };

    this.addSubscription = function (subscription, index) {
        var me = this;
        if (subscription instanceof Subscription) {
            if (index > -1) {
                this.subscriptions.splice(index, 1, subscription)
            } else {
                this.subscriptions.push(subscription);
            }
            subscription.checkForUpdates(function () {
                me.synchronize();
            });
        }
    }
}

function Subscription(name, link, idSelector, interval, viewSelector, lastValue) {
    if (arguments.length === 1 && arguments[0] instanceof Object) {
        this.createdAt = arguments[0].createdAt;
        this.updatedAt = arguments[0].updatedAt;
        this.name = arguments[0].name;
        this.link = arguments[0].link;
        this.idSelector = arguments[0].idSelector;
        this.interval = arguments[0].interval || (5 * 60 * 1000);
        this.lastUpdateDate = arguments[0].lastUpdateDate;
        this.viewSelector = arguments[0].viewSelector;
        this.lastValue = arguments[0].lastValue;
        this.updateCount = arguments[0].updateCount;
        this.error = arguments[0].error;
    } else {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.name = name;
        this.link = link;
        this.idSelector = idSelector;
        this.interval = interval || (5 * 60 * 1000);
        this.lastUpdateDate = new Date().getTime();
        this.viewSelector = viewSelector;
        this.lastValue = lastValue;
        this.updateCount = 0;
        this.error = false;
    }
    this.checking = false;
}

Subscription.prototype.checkForUpdates = function (cb) {
    var me = this;
    me.checking = true;
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (res) {
        try {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(res.srcElement.responseText, "text/html");
                    var results = doc.querySelectorAll(me.idSelector);
                    if (!me.lastValue) {
                        if (results.length > 0) {
                            me.updateCount = 0;
                            me.lastValue = results[0].innerHTML;
                        }
                    }
                    var updateCountNewValue = 0;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].innerHTML === me.lastValue) {
                            break;
                        }
                        updateCountNewValue++;
                    }
                    if (me.updateCount < updateCountNewValue) {
                        chrome.notifications.create(undefined, {
                            type: 'basic',
                            iconUrl: '../icons/icon128.png',
                            title: 'Update On Page',
                            message: 'Subscription: ' + me.name + '<br>' + (updateCountNewValue - me.updateCount) + ' new items.'
                        });
                    }
                    me.updateCount = updateCountNewValue;
                    me.lastUpdateDate = new Date().getTime();
                    me.hasErrors = false;
                    me.checking = false;
                    cb();
                } else {
                    throw {status: this.status, statusText: this.statusText, responseText: this.responseText};
                }
            }
        } catch (e) {
            me.error = e;
            me.lastUpdateDate = new Date().getTime();
            me.checking = false;
            cb();
        }
    };
    req.open('GET', this.link);
    req.send();

};

Subscription.prototype.getIntervalH = function () {
    var duration = this.interval;

    var
        milliseconds = parseInt((duration % 1000)),
        seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24),
        days = parseInt((duration / (1000 * 60 * 60 * 24)));
    return (days ? days + "d " : '') +
        (hours ? hours + "h " : '') +
        (minutes ? minutes + "m " : '') +
        (seconds ? seconds + "s " : '') +
        (milliseconds ? milliseconds + "ms " : '');
};


/*Subscription.prototype.initialize = function(cb){
    var parser = new DOMParser();
    var doc = parser.parseFromString(res.srcElement.responseText, "text/html");
    var results = doc.querySelectorAll(this.idSelector);
    if(results.length > 0){
        this.lastValue = results[0].innerHTML;
    }
    this.updateCount = 0;
    cb();
};*/