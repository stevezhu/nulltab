import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import { registerTabService } from '#api/TabService.js';

export default defineBackground(() => {
  registerTabService();

  // Handle keyboard shortcuts
  browser.commands.onCommand.addListener((command) => {
    if (command === 'open_dashboard') {
      const dashboardUrl = browser.runtime.getURL('/dashboard.html');

      void browser.tabs.query({ url: dashboardUrl }).then(([tab]) => {
        if (tab?.id !== undefined) {
          // Dashboard already open, switch to it
          void browser.tabs.update(tab.id, { active: true });
          void browser.windows.update(tab.windowId, { focused: true });
        } else {
          // Dashboard not open, create new tab
          void browser.tabs.create({ url: dashboardUrl });
        }
      });
    }
  });
});
