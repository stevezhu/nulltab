import { defineProxyService } from '@webext-core/proxy-service';
import { type Browser, browser } from 'wxt/browser';

import { hasAtLeastOne } from '#utils/array.js';
import { createMainTabGroup, getMainTabGroup } from '#utils/management.js';
import { getTabIds, reloadAndFocusTab, sortTabs } from '#utils/tabs.js';

type Tab = Browser.tabs.Tab;

/**
 * The maximum number of recent tabs to keep ungrouped when switching to a new tab.
 *
 * This is used to keep the target tab and up to 4 most recently accessed tabs
 * ungrouped, while grouping all other tabs in the main window.
 */
const MAX_RECENT_TABS = 4;

/**
 * Switches to the given tab and manages grouping/ungrouping in the main window.
 *
 * If the tab is not in the main window or is pinned, it simply focuses the tab.
 * Otherwise, it manages tab grouping by keeping the target tab and up to 4 most
 * recently accessed tabs ungrouped, while grouping all other tabs in the main window.
 *
 * @param options
 */
async function switchTab({
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
    await reloadAndFocusTab(targetTab);
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

  // 2. Collapse the tab group, move tabs in order, and focus the target tab
  await Promise.all([
    browser.tabGroups.update(mainTabGroupId, {
      collapsed: true,
    }),
    // Move all open tabs to end: target tab first, then recent tabs (most to least recent)
    browser.tabs.move(tabsToOpenIds, { index: -1 }),
    reloadAndFocusTab(targetTab),
  ]);
}

/**
 * Suspends (discards) tabs in the main tab group that haven't been accessed in 24 hours.
 *
 * This helps free up memory by discarding tabs that haven't been used recently.
 * The tabs remain in the browser but their content is unloaded until they're accessed again.
 */
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

/**
 * Suspends (discards) all non-suspended tabs in the main tab group.
 *
 * This frees up memory by discarding all tabs in the main group, regardless of
 * when they were last accessed. The tabs remain in the browser but their content
 * is unloaded until they're accessed again.
 */
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

/**
 * Manages all tabs in the specified window by adding them to the main tab group.
 *
 * @param options
 */
async function manageWindow({ windowId }: { windowId: number }) {
  const tabs = await browser.tabs.query({ windowId });
  const tabIds = tabs
    .map((tab) => tab.id)
    .filter((id): id is number => Boolean(id));
  await createMainTabGroup({ tabIds });
}

export const [registerTabService, getTabService] = defineProxyService(
  'TabService',
  function createTabService() {
    return {
      switchTab,
      manageWindow,

      // commands
      suspendStaleTabs,
      suspendGroupedTabs,
    };
  },
);
