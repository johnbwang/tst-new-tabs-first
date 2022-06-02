/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const TST_ID = 'treestyletab@piro.sakura.ne.jp';

async function registerToTST() {
  try {
    await browser.runtime.sendMessage(TST_ID, {
      type: 'register-self' ,
      name: browser.i18n.getMessage('extensionName'),
      listeningTypes: [
        'new-tab-processed',
      ],
    });
  } catch(_error) {
    // TST is not available
  }
}

registerToTST();

browser.runtime.onMessageExternal.addListener(async (message, sender) => {
  switch (sender.id) {
    case TST_ID:
      switch (message.type) {
        case 'ready':
        case 'permissions-changed':
          registerToTST();
          break;
        case 'new-tab-processed':
          if (message.tab.ancestorTabIds.length == 0) {
            let tabs = await browser.runtime.sendMessage(TST_ID, {
              type:   'get-tree',
              window: message.tab.windowId
            });
            browser.tabs.move(message.tab.id, {index: getFirstUnpinnedIndex(tabs)})
          }
      }
      break;
  }
});

function getFirstUnpinnedIndex(tabs) {
  for (let tab of tabs) {
    if (tab.pinned == false) {
      return tab.index;
    }
  }

  return getLastIndexInSubtree(tabs[tabs.length - 1]);
}

function getLastIndexInSubtree(tab) {
  while (tab.children.length != 0) {
    tab = tab.children[tab.children.length - 1];
  }

  return tab.index;
}