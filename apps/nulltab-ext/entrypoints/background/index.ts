import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import { registerTabService } from '#api/TabService.js';

const DASHBOARD_URL = browser.runtime.getURL('/dashboard.html');

export default defineBackground(() => {
  registerTabService();

  // Handle keyboard shortcuts
  browser.commands.onCommand.addListener((command) => {
    if (command === 'open_dashboard') {
      void browser.tabs.query({ url: DASHBOARD_URL }).then(([tab]) => {
        if (tab?.id !== undefined) {
          // Dashboard already open, switch to it
          void browser.tabs.update(tab.id, { active: true });
          void browser.windows.update(tab.windowId, { focused: true });
        } else {
          // Dashboard not open, create new tab
          void browser.tabs.create({ url: DASHBOARD_URL });
        }
      });
    }
  });
});
