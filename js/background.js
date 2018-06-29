chrome.gcm.onMessage.addListener(function(message) {
  var
      info = JSON.parse(message.data.info),
      id = info.id.toString(),
      options = {
        title: 'FunDz',
        iconUrl: 'img/notification_icon.png',
        type: 'list',
        message: message.data.alert,
        items: [
          {title: 'Organization:', message: info.name},
          {title: 'Money raised:', message: info.money_raised.toString()},
          {title: 'Offered for sale:', message: info.offered_for_sale.toString()},
          {title: 'Minimum investment:', message: info.min_investment.toString()}
        ]
      };
  chrome.notifications.create(id, options, function() { update_badge_counter(); });
});

chrome.notifications.onClicked.addListener(function(id) {
  var url = 'http://app.fundz.net/filings/' + id;
  chrome.tabs.create({url: url});
  chrome.notifications.clear(id, function() {
    update_badge_counter()
  })
});

chrome.notifications.onClosed.addListener(function() {
  update_badge_counter()
});

function update_badge_counter() {
  chrome.notifications.getAll( function(notifications){
    var notifications_count = Object.keys(notifications).length;
    if (notifications_count > 0) {
      chrome.browserAction.setBadgeText({
        text: notifications_count.toString()
      });
    } else {
      chrome.browserAction.setBadgeText({
        text: ''
      });
    }
  });
}

