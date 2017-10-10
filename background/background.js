/*function checkForValidUrl(tabId, changeInfo, tab) {
	if (tab.url.indexOf('sms.tsu.ge/sms/Students/Cxrilebi') > -1) {
		chrome.pageAction.show(tabId);
	}
};*/
var cb;
var port = chrome.extension.connect({name: "Sample Communication"});
setInterval(function () {
    var app = new UpdateNotifier();
    var currentDate = new Date().getTime();
    app.subscriptions.forEach(function (s) {
        if (!s.lastUpdateDate || ((s.lastUpdateDate + parseInt(s.interval)) < currentDate)) {
            s.checkForUpdates(function () {
                app.synchronize();
            });
        }
    });
}, 5000);