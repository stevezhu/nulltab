import { type Browser, browser } from 'wxt/browser';

import { TabData } from '#models/index.js';

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

export async function reloadAndFocusTab(tab: Tab) {
  await Promise.all([
    tab.id !== undefined && tab.discarded && browser.tabs.reload(tab.id),
    browser.tabs.update(tab.id, { active: true }),
    browser.windows.update(tab.windowId, { focused: true }),
  ]);
}
