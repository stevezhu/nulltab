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
 * The maximum number of tabs to keep ungrouped when switching to a new tab.
 *
 * This is used to keep the target tab and up to 4 most recently accessed tabs
 * ungrouped by default, while grouping all other tabs in the main window.
 */
const DEFAULT_MAX_UNGROUPED_TABS = 5;

/**
 * This should be mainly only called from service workers.
 *
 * @param options
 */
export async function regroupTabs({
  tabId,
  mainWindowId,
  mainTabGroupId,
  // TODO: check what if the number is negative
  maxUngroupedTabs = DEFAULT_MAX_UNGROUPED_TABS,
}: {
  /**
   * The id of the tab being focused.
   */
  tabId: number;
  mainWindowId: number;
  mainTabGroupId: number;
  /**
   * The maximum number of ungrouped tabs to keep open when switching tabs.
   */
  maxUngroupedTabs?: number;
}) {
  const tabs = await browser.tabs.query({ windowId: mainWindowId });
  const tabIds = getTabIds(tabs);

  const recentTabs: Tab[] = [];
  const tabsToGroup: Tab[] = [];
  // NOTE: sorting is honestly probably faster than maxheap with the number of items we're dealing
  // with. A user most likely wouldn't have more than 1000 tabs open.
  for (const tab of sortTabs(tabs)) {
    if (tab.pinned || tab.id === tabId) continue;

    if (recentTabs.length < maxUngroupedTabs - 1) {
      recentTabs.push(tab);
    } else if (tab.groupId !== mainTabGroupId) {
      tabsToGroup.push(tab);
    }
  }

  // TODO: should we keep recent tabs in the same order or just sort it by recent?
  // keep recent tabs in the same order
  const recentTabIdsSet = new Set(getTabIds(recentTabs));
  const recentTabIdsInOrder = tabIds.filter((tabId) =>
    recentTabIdsSet.has(tabId),
  );
  const ungroupedTabIds = [...recentTabIdsInOrder, tabId];
  const groupedTabIds = getTabIds(tabsToGroup);

  // 1. Group and ungroup the corresponding tabs
  await Promise.all([
    hasAtLeastOne(ungroupedTabIds) && browser.tabs.ungroup(ungroupedTabIds),
    hasAtLeastOne(groupedTabIds) &&
      browser.tabs.group({
        groupId: mainTabGroupId,
        tabIds: groupedTabIds,
      }),
  ]);

  // 2. Collapse the tab group and move tabs in order
  await Promise.all([
    browser.tabGroups.update(mainTabGroupId, {
      collapsed: true,
    }),
    // Move all open tabs to end: target tab first, then recent tabs (most to least recent)
    browser.tabs.move(ungroupedTabIds, { index: -1 }),
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
  maxUngroupedTabs = DEFAULT_MAX_UNGROUPED_TABS,
}: {
  tabId: number;
  mainTabGroupId?: number;
  mainWindowId?: number;
  maxUngroupedTabs?: number;
}) {
  const targetTab = await browser.tabs.get(tabId);

  // Regroup if tab is in the main tab group OR if there are more than 5 ungrouped tabs
  if (
    mainWindowId !== undefined &&
    mainTabGroupId !== undefined &&
    targetTab.windowId === mainWindowId &&
    (targetTab.groupId === mainTabGroupId ||
      (await browser.tabs
        .query({
          windowId: mainWindowId,
          groupId: browser.tabGroups.TAB_GROUP_ID_NONE,
        })
        .then((tabs) => tabs.length)) > maxUngroupedTabs)
  ) {
    await regroupTabs({
      tabId,
      mainWindowId,
      mainTabGroupId,
      maxUngroupedTabs,
    });
  }
  await reloadAndFocusTab(targetTab);
}

/**
 * Uses the chrome extension api to get the favicon url for a website.
 * @param u
 * @returns
 */
export function getFavIconUrl(u: string) {
  // @ts-expect-error wxt public paths aren't typed correctly to include favicon path
  const url = new URL(browser.runtime.getURL('/_favicon/'));
  url.searchParams.set('pageUrl', u);
  url.searchParams.set('size', '32');
  return url.toString();
}
