function UpdateNotifier() {
    this.subscriptions = [];
}
localStorage.updateNotifier = localStorage.updateNotifier || new UpdateNotifier();


function Subscription(name, link, idSelector, viewSelector, lastValue) {
    this.createdAt = new Date();
    this.name = name;
    this.link = link;
    this.idSelector = idSelector;
    this.viewSelector = viewSelector;
    this.lastValue = lastValue;
}