/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

const TST_ID = 'treestyletab@piro.sakura.ne.jp';

browser.tabs.onCreated.addListener(async (newTab) => {
  console.log('onCreated');
  let tabs = await browser.runtime.sendMessage(TST_ID, {
    type:   'get-tree',
    window: newTab.windowId
  });

  for (let tab of tabs) {
    if (tab.id == newTab.id && tab.ancestorTabIds.length == 0) {
      browser.tabs.move(newTab.id, {index: getFirstUnpinnedIndexIndex(tabs)});
      break;
    }
  }
});

function getFirstUnpinnedIndexIndex(tabs) {
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