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
  };
}

export async function manageWindow({ windowId }: { windowId: number }) {
  // Get all tabs for the window
  const tabs = await browser.tabs.query({ windowId });
  const tabIds = tabs
    .map((tab) => tab.id)
    .filter((id): id is number => Boolean(id));

  if (tabIds.length === 0) return;

  let { mainTabGroupId } = await browser.storage.local.get<{
    mainTabGroupId: number;
  }>('mainTabGroupId');

  // Group all tabs in the window if there is no main window
  mainTabGroupId = await browser.tabs.group({
    groupId: mainTabGroupId,
    tabIds: tabIds as [number, ...number[]],
  });
  await browser.storage.local.set({ mainTabGroupId });

  // save all other tabs to tab group then make current one active

  // Collapse the tab group
  void browser.tabGroups.update(mainTabGroupId, {
    collapsed: true,
    title: 'Managed',
  });
}

export async function openManagedTab({
  mainTabGroupId,
  mainWindowId,
  tabId,
}: {
  mainTabGroupId: number;
  mainWindowId: number;
  tabId: number;
}) {
  const ungroupedTabs = await browser.tabs.query({
    windowId: mainWindowId,
    groupId: browser.tabGroups.TAB_GROUP_ID_NONE,
  });
  const ungroupedTabIds = getTabIds(ungroupedTabs);
  await Promise.all([
    browser.tabs.ungroup(tabId),
    hasAtLeastOne(ungroupedTabIds) &&
      browser.tabs.group({
        groupId: mainTabGroupId,
        tabIds: ungroupedTabIds,
      }),
  ]);
  await Promise.all([
    browser.tabGroups.update(mainTabGroupId, {
      collapsed: true,
    }),
    browser.tabs.update(tabId, { active: true }),
    browser.tabs.move(tabId, { index: -1 }),
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
