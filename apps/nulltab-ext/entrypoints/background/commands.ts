import { browser } from 'wxt/browser';

import { getMainTabGroup } from '#utils/management.js';
import { switchTab } from '#utils/tabs.js';

const DASHBOARD_URL = browser.runtime.getURL('/dashboard.html');

export async function openDashboard() {
  const [tab] = await browser.tabs.query({ url: DASHBOARD_URL });
  if (tab?.id !== undefined) {
    // Dashboard already open, switch to it and send flash message
    const mainTabGroup = await getMainTabGroup();
    await switchTab({
      tabId: tab.id,
      mainTabGroupId: mainTabGroup?.id,
      mainWindowId: mainTabGroup?.windowId,
    });

    // Send message to dashboard to trigger flash effect
    // void browser.tabs.sendMessage(tab.id, {
    //   type: 'FLASH_DASHBOARD',
    // });
  } else {
    // Dashboard not open, create new tab
    await browser.tabs.create({ url: DASHBOARD_URL });
  }
}
