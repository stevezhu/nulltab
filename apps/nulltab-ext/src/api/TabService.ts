import { defineProxyService } from '@webext-core/proxy-service';
import { type Browser, browser } from 'wxt/browser';

import { hasAtLeastOne } from '#utils/array.js';
import { getMainTabGroup, getTabIds, sortTabs } from '#utils/management.js';

type Tab = Browser.tabs.Tab;

const MAX_RECENT_TABS = 4;

/**
 * Focuses the given tab and groups/ungroups tabs as needed in the main window.
 * @param options
 */
async function focusTab({
  tabId,
  mainTabGroupId,
  mainWindowId,
}: {
  tabId: number;
  mainTabGroupId?: number;
  mainWindowId?: number;
}) {
  const targetTab = await browser.tabs.get(tabId);

  // we only group and ungroup tabs in the main window that aren't pinned
  // if it's not in the main window or pinned, just focus the tab
  const isTargetTabInMainWindow = targetTab.windowId === mainWindowId;
  if (
    !mainTabGroupId ||
    !mainWindowId ||
    !isTargetTabInMainWindow ||
    targetTab.pinned
  ) {
    await Promise.all([
      targetTab.discarded && browser.tabs.reload(tabId),
      browser.tabs.update(tabId, { active: true }),
      browser.windows.update(targetTab.windowId, { focused: true }),
    ]);
    return;
  }

  // Get all tabs in the window (both grouped and ungrouped) sorted by most recent
  const sortedTabs = await browser.tabs
    .query({ windowId: mainWindowId })
    .then(sortTabs);

  const recentTabs: Tab[] = [];
  const tabsToGroup: Tab[] = [];
  for (const tab of sortedTabs) {
    if (tab.pinned || tab.id === tabId) continue;

    if (recentTabs.length < MAX_RECENT_TABS) {
      recentTabs.push(tab);
    } else if (tab.groupId !== mainTabGroupId) {
      tabsToGroup.push(tab);
    }
  }

  const tabsToOpen = [targetTab, ...recentTabs].reverse();
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

async function suspendStaleTabs() {
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

async function suspendGroupedTabs() {
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
    focusTab,

    // commands
    suspendStaleTabs,
    suspendGroupedTabs,
  };
}

export const [registerTabService, getTabService] = defineProxyService(
  'TabService',
  createTabService,
);
