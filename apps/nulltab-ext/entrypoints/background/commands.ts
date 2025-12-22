import { browser } from 'wxt/browser';

import { getMainTabGroup } from '#utils/management.js';
import { switchTab } from '#utils/tabs.js';

const DASHBOARD_URL = browser.runtime.getURL('/dashboard.html');

export async function openDashboard() {
  const [tab] = await browser.tabs.query({ url: DASHBOARD_URL });
  if (!tab) {
    // Dashboard not open, create new tab
    await browser.tabs.create({ url: DASHBOARD_URL });
  } else if (tab.active) {
    // TODO: not necessarily needed for now
    // Dashboard is already focused, send message to trigger flash effect
    // await extensionMessaging.sendMessage('flashTab', undefined, tab.id);
  } else if (tab.id !== undefined) {
    // Dashboard already open, switch to it
    const mainTabGroup = await getMainTabGroup();
    await switchTab({
      tabId: tab.id,
      mainTabGroupId: mainTabGroup?.id,
      mainWindowId: mainTabGroup?.windowId,
    });
  }
}
