/*function checkForValidUrl(tabId, changeInfo, tab) {
	if (tab.url.indexOf('sms.tsu.ge/sms/Students/Cxrilebi') > -1) {
		chrome.pageAction.show(tabId);
	}
};*/
var cb;
var port = chrome.extension.connect({name: "Sample Communication"});
setInterval(function () {
    const app = new UpdateNotifier();
    const currentDate = new Date().getTime();
    app.subscriptions.forEach(function (subscription) {
        if (!subscription.lastUpdateDate || ((subscription.lastUpdateDate + parseInt(subscription.interval)) < currentDate)) {
            subscription.checkForUpdates(function () {
                app.writeToLocalStorage();
            });
        }
    });
}, 5000);