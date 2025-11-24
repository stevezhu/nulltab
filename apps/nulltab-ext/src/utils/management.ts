import { type Browser, browser } from 'wxt/browser';
import { storage } from 'wxt/utils/storage';

import { TabData } from '#models/index.js';

export async function openSidePanel() {
  const currentWindow = await browser.windows.getCurrent();
  if (!currentWindow.id) return;
  await browser.sidePanel.open({ windowId: currentWindow.id });
}

export async function focusTab(tabId: number) {
  await browser.tabs.update(tabId, { active: true });
  const tab = await browser.tabs.get(tabId);
  await browser.windows.update(tab.windowId, { focused: true });
}

export function convertTabToTabData(tab: Browser.tabs.Tab): TabData {
  if (tab.id === undefined) throw new Error('Tab ID is required');
  return {
    id: tab.id,
    windowId: tab.windowId,
    title: tab.title,
    url: tab.url,
    favIconUrl: tab.favIconUrl,
    active: tab.active,
    lastAccessed: tab.lastAccessed,
  };
}

export async function manageWindow({ windowId }: { windowId: number }) {
  const tabs = await browser.tabs.query({ windowId });
  const tabIds = tabs
    .map((tab) => tab.id)
    .filter((id): id is number => Boolean(id));
  await createMainTabGroup({ tabIds });
}

const TOTAL_OPEN_TABS = 5;

export async function openManagedTab({
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

  // Get the 4 most recent tabs (excluding the target tab)
  const recentTabIds = getTabIds(sortedTabs)
    .filter((id) => id !== tabId)
    .slice(0, TOTAL_OPEN_TABS - 1);

  // Combine target tab with recent tabs
  const tabsToOpen = [tabId, ...recentTabIds];
  const tabsToOpenSet = new Set(tabsToOpen);

  // Get all tabs that should be grouped (not in tabsToOpen)
  const tabsToGroup = getTabIds(
    allTabs.filter(
      (tab) =>
        tab.id !== undefined &&
        tab.groupId !== mainTabGroupId &&
        !tabsToOpenSet.has(tab.id),
    ),
  );

  // 1. Group and ungroup the corresponding tabs
  await Promise.all([
    hasAtLeastOne(tabsToOpen) && browser.tabs.ungroup(tabsToOpen),
    hasAtLeastOne(tabsToGroup) &&
      browser.tabs.group({
        groupId: mainTabGroupId,
        tabIds: tabsToGroup,
      }),
  ]);
  // 2. Collapse the tab group, move tabs in order, and focus the target tab
  await Promise.all([
    browser.tabGroups.update(mainTabGroupId, {
      collapsed: true,
    }),
    // Move all open tabs to end: target tab first, then recent tabs (most to least recent)
    browser.tabs.move(tabsToOpen, { index: -1 }),
    browser.tabs.update(tabId, { active: true }),
    browser.windows.update(mainWindowId, { focused: true }),
  ]);
}

export function getTabIds(tabs: Browser.tabs.Tab[]): number[] {
  return tabs.map((tab) => tab.id).filter((id): id is number => Boolean(id));
}

export function sortTabs(tabs: Browser.tabs.Tab[]): Browser.tabs.Tab[] {
  return tabs.sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0));
}

function hasAtLeastOne<T>(array: T[]): array is [T, ...T[]] {
  return array.length > 0;
}

const WATERMARK = '\u200B'; // Zero-width space
const WATERMARKED_MAIN_TAB_GROUP_TITLE = `Managed${WATERMARK}`;

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

export async function getMainTabGroup(): Promise<
  Browser.tabGroups.TabGroup | undefined
> {
  const mainTabGroupId = await mainTabGroupIdStorage.getValue();

  // 1. Attempt to get the main tab group from the id
  if (mainTabGroupId !== null) {
    const mainTabGroup = await browser.tabGroups
      .get(mainTabGroupId)
      .catch(() => undefined);
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
  if (!mainTabGroup) return undefined;

  // 3. Set the main tab group id since we found it
  await mainTabGroupIdStorage.setValue(mainTabGroup.id);
  return mainTabGroup;
}
