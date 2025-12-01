import { defineProxyService } from '@webext-core/proxy-service';
import { browser } from 'wxt/browser';

import { hasAtLeastOne } from '#utils/array.js';
import { getMainTabGroup, getTabIds, sortTabs } from '#utils/management.js';

type Tab = Browser.tabs.Tab;

const MAX_RECENT_TABS = 4;

async function openManagedTab({
  mainTabGroupId,
  mainWindowId,
  tabId,
}: {
  mainTabGroupId: number;
  mainWindowId: number;
  tabId: number;
}) {
  // Get all tabs in the window (both grouped and ungrouped) sorted by most recent
  const allTabs = await browser.tabs.query({ windowId: mainWindowId });
  const sortedTabs = sortTabs(allTabs);

  let targetTab: Tab | undefined = undefined;
  const recentTabs: Tab[] = [];
  const tabsToGroup: Tab[] = [];
  for (const tab of sortedTabs) {
    if (tab.pinned) continue;
    if (tab.id === tabId) {
      targetTab = tab;
    } else if (recentTabs.length < MAX_RECENT_TABS) {
      recentTabs.push(tab);
    } else if (tab.groupId !== mainTabGroupId) {
      tabsToGroup.push(tab);
    }
  }

  if (!targetTab) {
    throw new Error(`Target tab not found: ${tabId}`);
  }

  const tabsToOpen = [targetTab, ...recentTabs];
  const tabsToOpenIds = getTabIds(tabsToOpen);
  const tabsToGroupIds = getTabIds(tabsToGroup);

  // 1. Group and ungroup the corresponding tabs
  await Promise.all([
    hasAtLeastOne(tabsToOpenIds) && browser.tabs.ungroup(tabsToOpenIds),
    hasAtLeastOne(tabsToGroupIds) &&
      browser.tabs.group({
        groupId: mainTabGroupId,
        tabIds: tabsToGroupIds,
      }),
  ]);

  // 2. Reload discarded tabs
  for (const tab of tabsToOpen) {
    if (tab.id && tab.discarded) {
      await browser.tabs.reload(tab.id);
    }
  }

  // 3. Collapse the tab group, move tabs in order, and focus the target tab
  await Promise.all([
    browser.tabGroups.update(mainTabGroupId, {
      collapsed: true,
    }),
    // Move all open tabs to end: target tab first, then recent tabs (most to least recent)
    browser.tabs.move(tabsToOpenIds, { index: -1 }),
    browser.tabs.update(tabId, { active: true }),
    browser.windows.update(mainWindowId, { focused: true }),
  ]);
}

async function discardStaleTabs() {
  const mainTabGroup = await getMainTabGroup();
  if (!mainTabGroup) return;
  const tabs = (await browser.tabs.query({ groupId: mainTabGroup.id })).filter(
    (tab) =>
      !tab.discarded &&
      tab.lastAccessed &&
      Date.now() - tab.lastAccessed > 1000 * 60 * 60 * 24,
  );
  for (const tab of tabs) {
    await browser.tabs.discard(tab.id);
  }
}

async function discardAllGroupedTabs() {
  const mainTabGroup = await getMainTabGroup();
  if (!mainTabGroup) return;
  const tabs = (await browser.tabs.query({ groupId: mainTabGroup.id })).filter(
    (tab) => !tab.discarded,
  );
  for (const tab of tabs) {
    await browser.tabs.discard(tab.id);
  }
}

function createTabService() {
  return {
    openManagedTab,

    // commands
    discardStaleTabs,
    discardAllGroupedTabs,
  };
}

export const [registerTabService, getTabService] = defineProxyService(
  'TabService',
  createTabService,
);
