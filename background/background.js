/*function checkForValidUrl(tabId, changeInfo, tab) {
	if (tab.url.indexOf('sms.tsu.ge/sms/Students/Cxrilebi') > -1) {
		chrome.pageAction.show(tabId);
	}
};*/

setInterval(function () {
    var appData = new UpdateNotifier();
    appData.subscriptions.forEach(function (s) {
        s.checkForUpdates(function () {
            appData.synchronize();
        })
    });
}, 15000);

chrome.browserAction.setBadgeText({text: ''});
bd = chrome.extension.getBackgroundPage();
bg=unreadCount = 0;