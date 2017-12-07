
browser.browserAction.onClicked.addListener(tab => importTabs());

// ------------- Vars -------------

var VALID_PROTOCOLS = [
  'http',
  'https',
  'file',
  'about'
];

var NOTIFY_TITLE = 'Tabs Import Add-on';

// ------------- Import -------------

async function importTabs() {
  try {
    console.log('importTabs()');
    
    var tabs = await browser.tabs.query({});
    var activeTab = await getActiveTab();
    var activeId = activeTab.id;
    
    var getTextScript = 'document.body.textContent';
    browser.tabs.executeScript(activeId, {code: getTextScript})
      .then(result => {
        if (result && result.length) {
          var text = result[0];
          openTabsFromList(text);
        }
      })
      .catch(error => {
        console.log('Error executing script:', error)
        notifyMsg('tabs-script-error', NOTIFY_TITLE, 'Error getting document content: ' + error);
      });
    
    console.log('End importTabs');
  }
  catch(e) {
    console.error('Exception importTabs():', e);
    notifyMsg('tabs-exception', NOTIFY_TITLE, 'Inner error: ' + e);
  }
}


function openTabsFromList(text) {
  var delim = /\n/;
  if (/\r\n/.test(text)) delim = /\r\n/;
  var lines = text.split(delim);
  
  lines.reduce((s, line) => {
    return s.then(() => {
      var url = line.trim();
      if (url.length && validUrl(url)) {
        return browser.tabs.create({url});
      }
    })
    .catch(error => {
      console.log('Error opening tabs:', error)
      notifyMsg('tabs-open-tabs-error', NOTIFY_TITLE, 'Error opening tabs: ' + error);
    });
  }, Promise.resolve());
}
