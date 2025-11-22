import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { browser } from 'wxt/browser';

import TopBar, { type TopBarFilterMode } from '#components/TopBar.js';
import {
  WindowCard,
  WindowCardTab,
  WindowCardTabs,
} from '#components/WindowCard.js';
import { WindowCardList } from '#components/WindowCardList.js';
import { useTabsQuery } from '#hooks/useTabsQuery.js';
import { useWindowsQuery } from '#hooks/useWindowsQuery.js';
import { WindowData } from '#models/index.js';
import {
  convertTabToTabData,
  focusTab,
  manageWindow,
  openManagedTab,
  openSidePanel,
  sortTabs,
} from '#utils/management.js';

function getFilteredTabs({
  tabs,
  searchQuery,
}: {
  tabs: Browser.tabs.Tab[];
  searchQuery: string;
}): Browser.tabs.Tab[] {
  if (!searchQuery) return tabs;

  const lowerQuery = searchQuery.toLowerCase();
  return tabs.filter(
    (tab) =>
      tab.title?.toLowerCase().includes(lowerQuery) ||
      tab.url?.toLowerCase().includes(lowerQuery),
  );
}

export default function App({ isPopup }: { isPopup?: boolean }) {
  const [filterMode, setFilterMode] = useState<TopBarFilterMode>('managed');
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="flex h-full flex-col">
      {/* Top Bar */}
      <TopBar
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSidePanelButton={isPopup}
        onOpenSidePanel={openSidePanel}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <AppContent filterMode={filterMode} searchQuery={searchQuery} />
      </div>
    </div>
  );
}

function AppContent({
  filterMode,
  searchQuery,
}: {
  filterMode: TopBarFilterMode;
  searchQuery: string;
}) {
  const tabsQuery = useTabsQuery();
  const windowsQuery = useWindowsQuery();
  const { managedWindows, unmanagedWindows } = windowsQuery.data;

  const filteredTabs = useMemo(() => {
    return getFilteredTabs({ tabs: tabsQuery.data, searchQuery });
  }, [tabsQuery.data, searchQuery]);

  // const closedWindowsQuery = useSuspenseQuery({
  //   queryKey: ['closedWindows'],
  //   queryFn: () => windowStorage.getClosedWindows(),
  // });
  // const closedWindows = closedWindowsQuery.data;

  const currentWindowQuery = useSuspenseQuery({
    queryKey: ['currentWindow'],
    queryFn: () => browser.windows.getCurrent(),
  });
  const currentWindow = currentWindowQuery.data;

  const mainInfoQuery = useSuspenseQuery<{
    mainTabGroupId?: number;
    mainWindowId?: number;
  }>({
    queryKey: ['mainInfo'],
    queryFn: async () => {
      const { mainTabGroupId } = await browser.storage.local.get<{
        mainTabGroupId: number;
      }>('mainTabGroupId');
      if (!mainTabGroupId) return {};

      // TODO: test what happens when you put a random tab group id
      const mainTabGroup = await browser.tabGroups.get(mainTabGroupId);
      return { mainTabGroupId, mainWindowId: mainTabGroup.windowId };
    },
  });
  const { mainTabGroupId, mainWindowId } = mainInfoQuery.data;

  const handleTabClick = ({ tabId }: { tabId: number }) => focusTab(tabId);

  // const handleCloseWindow = async (windowId: number) => {
  //   // Get all tabs for the window
  //   const tabs = await browser.tabs.query({ windowId });

  //   // Don't save empty windows
  //   if (tabs.length === 0) return;

  //   // Save window data to storage
  //   await windowStorage.saveClosedWindow({
  //     originalWindowId: windowId,
  //     tabs: tabs.map((tab) => ({
  //       title: tab.title,
  //       url: tab.url,
  //       favIconUrl: tab.favIconUrl,
  //     })),
  //     closedAt: new Date(),
  //   });

  //   // Remove from managed windows if it was managed
  //   await windowStorage.removeManagedWindow(windowId);

  //   // Close the window
  //   await browser.windows.remove(windowId);

  //   // Update local state
  //   await Promise.all([windowsQuery.refetch(), closedWindowsQuery.refetch()]);
  // };

  // const handleRestoreWindow = async (closedWindowId: string) => {
  //   const closedWindow = closedWindows.find((w) => w.id === closedWindowId);
  //   if (!closedWindow) return;

  //   // Extract URLs from tabs
  //   const urls = closedWindow.tabs
  //     .map((tab) => tab.url)
  //     .filter((url): url is string => typeof url === 'string');

  //   if (urls.length === 0) return;

  //   // Create new window with all tabs
  //   await browser.windows.create({ url: urls });

  //   // Remove from storage
  //   await windowStorage.removeClosedWindow(closedWindowId);

  //   // Update local state
  //   await Promise.all([windowsQuery.refetch(), closedWindowsQuery.refetch()]);
  // };

  // TODO: convert to mutation
  const handleManageWindow = async ({ windowId }: { windowId: number }) => {
    await manageWindow({ windowId });

    // Update local state
    await Promise.all([windowsQuery.refetch(), tabsQuery.refetch()]);
  };

  // const handleUnmanageWindow = async (windowId: number) => {
  //   // Get all tabs for the window
  //   const tabs = await browser.tabs.query({ windowId });

  //   // Ungroup all tabs that are in a group
  //   for (const tab of tabs) {
  //     if (tab.id && tab.groupId !== -1) {
  //       await browser.tabs.ungroup(tab.id);
  //     }
  //   }

  //   // Remove window ID from storage
  //   await windowStorage.removeManagedWindow(windowId);

  //   // Update local state
  //   await Promise.all([windowsQuery.refetch(), tabsQuery.refetch()]);
  // };

  const openWindows = useMemo(() => {
    const windows: WindowData[] = [];
    if (filterMode === 'unmanaged') {
      for (const window of unmanagedWindows) {
        if (!window.id) continue;
        windows.push({ id: window.id });
      }
    } else {
      for (const window of managedWindows) {
        if (!window.id) continue;
        windows.push({ id: window.id });
      }
    }
    return windows;
  }, [filterMode, unmanagedWindows, managedWindows]);

  const { managedTabs, unmanagedTabs } = useMemo(() => {
    const unmanagedTabs: Browser.tabs.Tab[] = [];
    const managedTabs: Browser.tabs.Tab[] = [];
    for (const tab of filteredTabs) {
      if (!tab.id) continue;
      (mainWindowId === tab.windowId ? managedTabs : unmanagedTabs).push(tab);
    }
    sortTabs(managedTabs);
    return { managedTabs, unmanagedTabs };
  }, [filteredTabs, mainWindowId]);

  if (filterMode === 'unmanaged') {
    return (
      <WindowCardList
        windows={openWindows}
        tabs={unmanagedTabs
          .filter((tab) => tab.id !== undefined)
          .map(convertTabToTabData)}
        currentWindowId={currentWindow.id}
        onManageWindow={handleManageWindow}
        onTabClick={handleTabClick}
      />
    );
  }
  if (managedTabs.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No managed tabs
      </div>
    );
  }
  return (
    <div>
      <WindowCard>
        <WindowCardTabs>
          {managedTabs.map((tab) => {
            return (
              <WindowCardTab
                key={tab.id}
                title={tab.title}
                url={tab.url}
                favIconUrl={tab.favIconUrl}
                active={'active' in tab ? tab.active : undefined}
                onClick={() => {
                  if (!tab.id || !mainTabGroupId || !mainWindowId) return;
                  void openManagedTab({
                    mainTabGroupId,
                    mainWindowId,
                    tabId: tab.id,
                  });
                }}
              />
            );
          })}
        </WindowCardTabs>
      </WindowCard>
    </div>
  );
}
