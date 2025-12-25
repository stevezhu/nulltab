import { browser } from 'wxt/browser';

import { getMainTabGroup } from '#utils/management.js';
import { switchTab } from '#utils/tabs.js';

const DASHBOARD_URL = browser.runtime.getURL('/dashboard.html');

export async function openDashboard(): Promise<void> {
  const [tab] = await browser.tabs.query({ url: DASHBOARD_URL });
  // Dashboard not open, create new tab
  if (!tab || tab.id === undefined) {
    await browser.tabs.create({ url: DASHBOARD_URL });
    return;
  }

  const window = await browser.windows.get(tab.windowId);
  if (tab.active && window.focused) {
    // TODO: not necessarily needed for now
    // Dashboard is already focused, send message to trigger flash effect
    // await extensionMessaging.sendMessage('flashTab', undefined, tab.id);
  } else {
    // Dashboard already open, switch to it
    const mainTabGroup = await getMainTabGroup();
    await switchTab({
      tabId: tab.id,
      mainTabGroupId: mainTabGroup?.id,
      mainWindowId: mainTabGroup?.windowId,
    });
  }
}
