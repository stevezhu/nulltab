import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { type Browser, browser } from 'wxt/browser';

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
  getMainTabGroup,
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

  const currentWindowQuery = useSuspenseQuery({
    queryKey: ['currentWindow'],
    queryFn: () => browser.windows.getCurrent(),
  });
  const currentWindow = currentWindowQuery.data;

  const mainTabGroupQuery = useSuspenseQuery({
    queryKey: ['mainTabGroup'],
    queryFn: () => getMainTabGroup(),
  });
  const mainTabGroup = mainTabGroupQuery.data;

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
      (mainTabGroup?.windowId === tab.windowId
        ? managedTabs
        : unmanagedTabs
      ).push(tab);
    }
    sortTabs(managedTabs);
    return { managedTabs, unmanagedTabs };
  }, [filteredTabs, mainTabGroup]);

  if (filterMode === 'unmanaged') {
    return (
      <WindowCardList
        windows={openWindows}
        tabs={unmanagedTabs
          .filter((tab) => tab.id !== undefined)
          .map(convertTabToTabData)}
        currentWindowId={currentWindow.id}
        onManageWindow={async ({ windowId }: { windowId: number }) => {
          await manageWindow({ windowId });

          // Update local state
          // TODO: use mutation
          await Promise.all([windowsQuery.refetch(), tabsQuery.refetch()]);
        }}
        onTabClick={({ tabId }: { tabId: number }) => focusTab(tabId)}
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
                lastAccessed={tab.lastAccessed}
                onClick={() => {
                  if (!tab.id || !mainTabGroup?.id || !mainTabGroup.windowId)
                    return;
                  void openManagedTab({
                    mainTabGroupId: mainTabGroup.id,
                    mainWindowId: mainTabGroup.windowId,
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
