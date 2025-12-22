import { type Browser, browser } from 'wxt/browser';

import { TabData } from '#models/index.js';
import { hasAtLeastOne } from '#utils/array.js';

type Tab = Browser.tabs.Tab;

export function convertTabToTabData(tab: Tab): TabData {
  if (tab.id === undefined) throw new Error('Tab ID is required');
  return {
    id: tab.id,
    windowId: tab.windowId,
    title: tab.title,
    url: tab.url,
    favIconUrl: tab.favIconUrl,
    active: tab.active,
    lastAccessed: tab.lastAccessed,
    discarded: tab.discarded,
  };
}

export function getTabIds(tabs: Tab[]): number[] {
  return tabs.map((tab) => tab.id).filter((id): id is number => Boolean(id));
}

export function sortTabs(tabs: Tab[]): Tab[] {
  return tabs.sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0));
}

export async function focusTab(tab: Tab) {
  await Promise.all([
    browser.tabs.update(tab.id, { active: true }),
    browser.windows.update(tab.windowId, { focused: true }),
  ]);
}

/**
 * Reloads tab if it is discarded and then focuses it.
 * @param tab
 */
export async function reloadAndFocusTab(
  tab: Pick<Tab, 'id' | 'windowId' | 'discarded'>,
) {
  await Promise.all([
    tab.id !== undefined && tab.discarded && browser.tabs.reload(tab.id),
    browser.tabs.update(tab.id, { active: true }),
    browser.windows.update(tab.windowId, { focused: true }),
  ]);
}

/**
 * The maximum number of recent tabs to keep ungrouped when switching to a new tab.
 *
 * This is used to keep the target tab and up to 4 most recently accessed tabs
 * ungrouped, while grouping all other tabs in the main window.
 */
const MAX_RECENT_TABS = 4;

/**
 * This should be mainly only called from service workers.
 *
 * @param options
 */
export async function regroupTabs({
  tabId,
  mainWindowId,
  mainTabGroupId,
}: {
  /**
   * The id of the tab being focused.
   */
  tabId: number;
  mainWindowId: number;
  mainTabGroupId: number;
}) {
  const tabs = await browser.tabs.query({ windowId: mainWindowId });
  const sortedTabs = sortTabs(tabs);

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

  // keep recent tabs in the same order
  const recentTabIdsSet = new Set(getTabIds(recentTabs));
  const recentTabIdsInOrder = tabs.filter(
    (tab) => tab.id !== undefined && recentTabIdsSet.has(tab.id),
  );
  const tabsToOpenIds = [...getTabIds(recentTabIdsInOrder), tabId];
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

  // 2. Collapse the tab group and move tabs in order
  await Promise.all([
    browser.tabGroups.update(mainTabGroupId, {
      collapsed: true,
    }),
    // Move all open tabs to end: target tab first, then recent tabs (most to least recent)
    browser.tabs.move(tabsToOpenIds, { index: -1 }),
  ]);
}

/**
 * Switches to the given tab and manages grouping/ungrouping in the main window.
 *
 * If the tab is not in the main window or is pinned, it simply focuses the tab.
 * Otherwise, it manages tab grouping by keeping the target tab and up to 4 most
 * recently accessed tabs ungrouped, while grouping all other tabs in the main window.
 *
 * @param options
 */
export async function switchTab({
  tabId,
  mainTabGroupId,
  mainWindowId,
}: {
  tabId: number;
  mainTabGroupId?: number;
  mainWindowId?: number;
}) {
  const targetTab = await browser.tabs.get(tabId);

  // only regroup if tab is in the main tab group
  if (
    mainWindowId !== undefined &&
    mainTabGroupId !== undefined &&
    targetTab.groupId === mainTabGroupId
  ) {
    await regroupTabs({ tabId, mainWindowId, mainTabGroupId });
  }
  await reloadAndFocusTab(targetTab);
}
