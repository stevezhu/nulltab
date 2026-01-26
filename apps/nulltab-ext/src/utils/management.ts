import { type Browser, browser } from 'wxt/browser';
import { storage } from 'wxt/utils/storage';

import { extensionMessaging } from '#api/extensionMessaging.js';
import { hasAtLeastOne } from '#utils/array.js';
import { switchTab } from '#utils/tabs.js';

type TabGroup = Browser.tabGroups.TabGroup;

/**
 * Open the side panel. This is only supported on Chromium-based browsers.
 * @returns
 */
export async function openSidePanel() {
  const currentWindow = await browser.windows.getCurrent();
  if (!currentWindow.id) return;
  await browser.sidePanel.open({ windowId: currentWindow.id });
}

const DASHBOARD_URL = browser.runtime.getURL('/dashboard.html');

export type OpenDashboardMode = 'global' | 'current-window' | 'always';

export async function openDashboard(
  mode: OpenDashboardMode = 'global',
): Promise<void> {
  if (mode === 'global' || mode === 'current-window') {
    const [tab] = await browser.tabs.query({
      url: DASHBOARD_URL,
      currentWindow: mode === 'current-window' ? true : undefined,
    });
    if (tab?.id !== undefined) {
      await extensionMessaging.sendMessage(
        'focusDashboardSearchInput',
        undefined,
        tab.id,
      );

      if (!tab.active || !(await browser.windows.get(tab.windowId)).focused) {
        const mainTabGroup = await getMainTabGroup();
        await switchTab({
          tabId: tab.id,
          mainTabGroupId: mainTabGroup?.id,
          mainWindowId: mainTabGroup?.windowId,
        });
      }

      return;
    }
  }

  await browser.tabs.create({ url: DASHBOARD_URL });
}

const WATERMARK = '\u200B'; // Zero-width space
const WATERMARKED_MAIN_TAB_GROUP_TITLE = `${WATERMARK}NullTab`;

const mainTabGroupIdStorage = storage.defineItem<number | null>(
  'local:mainTabGroupId',
  {
    fallback: null,
  },
);

export async function createMainTabGroup({
  tabIds,
}: {
  tabIds: number[];
}): Promise<void> {
  if (!hasAtLeastOne(tabIds)) return;

  const mainTabGroup = await getMainTabGroup();
  const mainTabGroupId = await browser.tabs.group({
    groupId: mainTabGroup?.id,
    tabIds,
  });
  await mainTabGroupIdStorage.setValue(mainTabGroupId);

  // Collapse tab group
  void browser.tabGroups.update(mainTabGroupId, {
    collapsed: true,
    title: WATERMARKED_MAIN_TAB_GROUP_TITLE,
  });
}

export async function getMainTabGroup(): Promise<TabGroup | null> {
  const mainTabGroupId = await mainTabGroupIdStorage.getValue();

  // 1. Attempt to get the main tab group from the id
  if (mainTabGroupId !== null) {
    const mainTabGroup = await browser.tabGroups
      .get(mainTabGroupId)
      .catch(() => null);
    if (mainTabGroup) {
      return mainTabGroup;
    }
    // reset id since we confirmed it is not valid
    await mainTabGroupIdStorage.setValue(null);
  }

  // 2. If the id is not valid, try to find the main tab group by title
  // XXX: only use the first main tab group found
  // TODO: merge if multiple main tab groups are found
  const [mainTabGroup] = await browser.tabGroups.query({
    title: WATERMARKED_MAIN_TAB_GROUP_TITLE,
  });
  if (!mainTabGroup) return null;

  // 3. Set the main tab group id since we found it
  await mainTabGroupIdStorage.setValue(mainTabGroup.id);
  return mainTabGroup;
}
