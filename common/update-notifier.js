const address = "updateNotifier";
const port = chrome.extension.connect({name: "Sample Communication"});

const knownSelectors = {
    "mymarket.ge": [
        {name: "სიახლე მერიისგან", idSelector: "ul.pr-search-list li", attribute: 'data-pr-id'}
    ],
    "tbilisi.gov.ge": [
        {name: "სიახლე მერიისგან", idSelector: ".newses .news .textual .title", idType: 'innerHtml'}
    ],
};

function UpdateNotifier() {
    this.readFromLocalStorage();
}

UpdateNotifier.prototype.readFromLocalStorage = function () {
    let appData = localStorage[address];
    if (!appData) {
        const emptyData = {subscriptions: [], trash: [], trashSize: 10};
        localStorage[address] = JSON.stringify(emptyData);
    }
    appData = JSON.parse(appData);
    this.subscriptions = (appData.subscriptions || []).map(subscription => new Subscription(subscription));
    this.trash = (appData.trash || []).map(deletedSubscription => new Subscription(deletedSubscription));
    this.trashSize = appData.trashSize || 10;
};

UpdateNotifier.prototype.writeToLocalStorage = function () {
    this.totalUpdates = 0;
    this.subscriptions.forEach(s => this.totalUpdates += (s.updateCount || 0));
    chrome.browserAction.setBadgeText({text: this.totalUpdates ? this.totalUpdates + '' : ''});
    localStorage[address] = JSON.stringify(this);
    //port.postMessage("sync please");
    return true;
};

UpdateNotifier.prototype.addSubscription = function (subscription, index) {

    if (subscription instanceof Subscription) {
        if (index > -1) {
            this.subscriptions.splice(index, 1, subscription);
        } else {
            this.subscriptions.push(subscription);
        }
        this.writeToLocalStorage();
        subscription.checkForUpdates(() => {

            this.writeToLocalStorage();
            this.readFromLocalStorage();
        });
    }
};

function Subscription(name, link, idSelector, attribute, interval, viewSelector, lastValue) {
    if (arguments.length === 1 && arguments[0] instanceof Object) {
        for (let key in arguments[0]) this[key] = arguments[0][key];
    } else {
        this.createdAt = new Date().getTime();
        this.updatedAt = new Date().getTime();
        this.name = name;
        this.link = link;
        this.idSelector = idSelector;
        this.interval = interval || (5 * 60 * 1000);
        this.lastUpdateDate = new Date().getTime();
        this.viewSelector = viewSelector;
        this.lastValue = lastValue;
        this.updateCount = 0;
        this.error = false;
        this.attribute = attribute;
    }
    this.checking = false;
}

Subscription.prototype.checkForUpdates = function (cb) {
    const thisSubscription = this;
    thisSubscription.checking = true;
    const req = new XMLHttpRequest();
    req.onreadystatechange = function (res) {
        try {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    /*when loaded successfully*/
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(res.srcElement.responseText, "text/html");
                    const results = doc.querySelectorAll(thisSubscription.idSelector);
                    if (!thisSubscription.lastValue) {
                        /*if this is newly added subscription or no value was found*/
                        thisSubscription.updateCount = 0;
                        thisSubscription.lastValue = results.length > 0 ? thisSubscription.retrieveValue(results[0]) : undefined;
                    }
                    let updateCountNewValue = 0;
                    let resultValue;
                    for (let i = 0; i < results.length; i++) {
                        resultValue = thisSubscription.retrieveValue(results[i]);
                        if (resultValue === thisSubscription.lastValue) {
                            break;
                        }
                        updateCountNewValue++;
                    }
                    if (thisSubscription.updateCount < updateCountNewValue) {
                        chrome.notifications.create(undefined, {
                            type: 'basic',
                            iconUrl: '../icons/icon128.png',
                            title: 'Update On Page',
                            message: 'Subscription: ' + thisSubscription.name + '\n' + (updateCountNewValue - thisSubscription.updateCount) + ' new items.'
                        });
                    }
                    thisSubscription.updateCount = updateCountNewValue;
                    thisSubscription.lastUpdateDate = new Date().getTime();
                    thisSubscription.hasErrors = false;
                    thisSubscription.checking = false;
                    cb();
                } else {
                    throw {status: this.status, statusText: this.statusText, responseText: this.responseText};
                }
            }
        } catch (e) {
            thisSubscription.error = e;
            thisSubscription.hasErrors = true;
            thisSubscription.lastUpdateDate = new Date().getTime();
            thisSubscription.checking = false;
            cb();
        }
    };
    req.open('GET', this.link);
    req.send();

};

Subscription.prototype.retrieveValue = function (element) {
    if (this.attribute) {
        return element.getAttribute(this.attribute);
    } else {
        return element.innerHTML;
    }
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