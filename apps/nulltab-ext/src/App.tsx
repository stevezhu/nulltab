import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { type Browser, browser } from 'wxt/browser';

import { mainTabGroupQueryOptions } from '#api/queryOptions/mainTabGroup.js';
import { getTabService } from '#api/TabService.js';
import TopBar, {
  TopBarCommand,
  type TopBarFilterMode,
} from '#components/TopBar.js';
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

const tabService = getTabService();

export default function App({ isPopup }: { isPopup?: boolean }) {
  const [filterMode, setFilterMode] = useState<TopBarFilterMode>('managed');
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="flex h-full flex-col">
      {/* Top Bar */}
      <TopBar
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        showSidePanelButton={isPopup}
        onOpenSidePanel={openSidePanel}
      >
        <TopBarCommand
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          commands={[
            {
              label: 'Discard Stale Tabs',
              onSelect: () => {
                void tabService.discardStaleTabs();
              },
            },
            {
              // NOTE: change the label here to be more understandable to users
              label: 'Discard All Hidden Tabs',
              onSelect: () => {
                void tabService.discardAllGroupedTabs();
              },
            },
            {
              label: 'Save All Tabs',
              onSelect: () => {
                console.log('Save All Tabs');
              },
            },
          ]}
        />
      </TopBar>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <AppContent
          filterMode={filterMode}
          searchQuery={searchQuery.startsWith('/') ? '' : searchQuery}
        />
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

  const mainTabGroupQuery = useSuspenseQuery(mainTabGroupQueryOptions);
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
          // TODO: use mutation, invalidate queries instead of refetching
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
              discarded={tab.discarded}
              onClick={() => {
                if (!tab.id || !mainTabGroup?.id || !mainTabGroup.windowId)
                  return;
                void tabService.openManagedTab({
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
  );
}
