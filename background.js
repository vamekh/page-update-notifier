/*function checkForValidUrl(tabId, changeInfo, tab) {
	if (tab.url.indexOf('sms.tsu.ge/sms/Students/Cxrilebi') > -1) {
		chrome.pageAction.show(tabId);
	}
};*/

/*
//მოუსმენს ყველა ტაბის ყველა ცვლილებას.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(function(tab){
		chrome.tabs.sendMessage(tab.id, {show: "change"}, function(response) {
		console.log(response);
	});	
});

*/

setInterval(function () {
    var appData = new UpdateNotifier();
    appData.subscriptions.forEach(function (s) {
        s.checkForUpdates(function () {
            appData.synchronize();
        })
    });
}, 15000);

/*
function processSubscription(subscription) {
    return function (res) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(res.srcElement.responseText, "text/html");
        var results = doc.querySelectorAll(subscription.idSelector);
        if (results.length === 0) subscription.updateCount = 0;
        var newValue = 0;
        for(var i = 0; i < results.length; i++){
            if (results[i].innerHTML === subscription.lastValue){
                newValue = i;
                break;
            }
        }
        subscription.updateCount = newValue;
        appData.synchronize();
        console.log('results', results);
    };
}*/
