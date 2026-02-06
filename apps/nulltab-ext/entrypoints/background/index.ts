import { registerService } from '@webext-core/proxy-service';
import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import { TABS_SERVICE_KEY } from '#api/proxyService/proxyServiceKeys.js';
import { TabsService } from '#api/proxyService/TabsService.js';
import { openDashboard } from '#utils/management.js';

export default defineBackground(() => {
  registerService(TABS_SERVICE_KEY, new TabsService());

  browser.commands.onCommand.addListener((command) => {
    switch (command) {
      case 'open_dashboard':
        void openDashboard('current-window');
        break;
    }
  });

  console.log('background script loaded');

  /**
   * This is for handling tabs that are focused through edge cases such as when chrome://extensions
   * is focused when it is already open. We don't want it to be opened within the tab group, so we
   * have to regroup the tabs.
   */
  // browser.tabs.onActivated.addListener((activeInfo) => {
  //   console.log('onActivated:activeInfo', activeInfo);
  //   (async () => {
  //     // const mainTabGroup = await getMainTabGroup();
  //     // console.log('mainTabGroup', mainTabGroup);
  //     // const targetTab = await browser.tabs.get(activeInfo.tabId);
  //     // console.log(
  //     //   'onActivated:targetTab',
  //     //   targetTab,
  //     //   targetTab.groupId === mainTabGroup?.id,
  //     // );
  //     // if (targetTab.groupId === mainTabGroup?.id) {
  //     //   console.log('regrouping tabs', {
  //     //     tabId: activeInfo.tabId,
  //     //     mainTabGroupId: mainTabGroup.id,
  //     //     mainWindowId: mainTabGroup.windowId,
  //     //   });
  //     //   await regroupTabs({
  //     //     tabId: activeInfo.tabId,
  //     //     mainTabGroupId: mainTabGroup.id,
  //     //     mainWindowId: mainTabGroup.windowId,
  //     //   });
  //     // }
  //   })().catch((err: unknown) => {
  //     if (
  //       err instanceof Error &&
  //       // chrome error message when trying to edit tabs when user focuses a tab manually
  //       // this is expected behavior, so we can ignore it
  //       // TODO: check this for other browsers
  //       err.message.includes('Tabs cannot be edited right now')
  //     ) {
  //       return;
  //     }
  //     throw err;
  //   });
  // });
});
