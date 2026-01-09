import { browser } from 'wxt/browser';

import { createMainTabGroup, getMainTabGroup } from '#utils/management.js';
import { switchTab as switchTabUtil } from '#utils/tabs.js';

export class TabsService {
  async switchTab({
    tabId,
    mainTabGroupId,
    mainWindowId,
  }: {
    tabId: number;
    mainTabGroupId?: number;
    mainWindowId?: number;
  }) {
    await switchTabUtil({ tabId, mainTabGroupId, mainWindowId });
  }

  /**
   * Manages all tabs in the specified window by adding them to the main tab group.
   *
   * @param options
   */
  async manageWindow({ windowId }: { windowId: number }) {
    const tabs = await browser.tabs.query({ windowId });
    const tabIds = tabs
      .map((tab) => tab.id)
      .filter((id): id is number => Boolean(id));
    await createMainTabGroup({ tabIds });
  }

  /**
   * Suspends (discards) tabs in the main tab group that haven't been accessed in 24 hours.
   *
   * This helps free up memory by discarding tabs that haven't been used recently.
   * The tabs remain in the browser but their content is unloaded until they're accessed again.
   */
  async suspendStaleTabs() {
    const mainTabGroup = await getMainTabGroup();
    if (!mainTabGroup) return;
    const tabs = (
      await browser.tabs.query({ groupId: mainTabGroup.id })
    ).filter(
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
  async suspendGroupedTabs() {
    const mainTabGroup = await getMainTabGroup();
    if (!mainTabGroup) return;
    const tabs = (
      await browser.tabs.query({ groupId: mainTabGroup.id })
    ).filter((tab) => !tab.discarded);
    for (const tab of tabs) {
      await browser.tabs.discard(tab.id);
    }
  }
}
