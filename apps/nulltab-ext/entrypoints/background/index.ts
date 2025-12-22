import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import { registerTabService } from '#api/TabService.js';
import { getMainTabGroup } from '#utils/management.js';
import { regroupTabs } from '#utils/tabs.js';

import { openDashboard } from './commands';

export default defineBackground(() => {
  registerTabService();

  browser.commands.onCommand.addListener((command) => {
    switch (command) {
      case 'open_dashboard':
        void openDashboard();
        break;
    }
  });

  /**
   * This is for handling tabs that are focused through edge cases such as when chrome://extensions
   * is focused when it is already open. We don't want it to be opened within the tab group, so we
   * have to regroup the tabs.
   */
  browser.tabs.onActivated.addListener((activeInfo) => {
    (async () => {
      const mainTabGroup = await getMainTabGroup();
      const targetTab = await browser.tabs.get(activeInfo.tabId);
      if (targetTab.groupId === mainTabGroup?.id) {
        await regroupTabs({
          tabId: activeInfo.tabId,
          mainTabGroupId: mainTabGroup.id,
          mainWindowId: mainTabGroup.windowId,
        });
      }
    })().catch((err: unknown) => {
      if (
        err instanceof Error &&
        // chrome error message when trying to edit tabs when user focuses a tab manually
        // this is expected behavior, so we can ignore it
        // TODO: check this for other browsers
        err.message.includes('Tabs cannot be edited right now')
      ) {
        return;
      }
      throw err;
    });
  });
});
