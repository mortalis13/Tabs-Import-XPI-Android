
browser.browserAction.onClicked.addListener(tab => importTabs());

// ------------- Vars -------------

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
  
  var totalImported = 0;
  
  Promise.all(lines.map(url => {
    var url = url.trim();
    if (url.length && validUrl(url)) {
      totalImported++;
      return browser.tabs.create({url});
    }
  }))
  .then(() => {
    console.log('Total imported:', totalImported);
    if (!totalImported) {
      notifyMsg('tabs-import-no-tabs', NOTIFY_TITLE, 'No tabs are imported');
    }
  });
}
