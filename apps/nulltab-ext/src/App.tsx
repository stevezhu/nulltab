import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@workspace/shadcn/components/button';
import { FolderInput, FolderOutput, RotateCcw, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type Browser, browser } from 'wxt/browser';

import { useTabsQuery } from '#hooks/useTabsQuery.ts';
import { useWindowsQuery } from '#hooks/useWindowsQuery.ts';

import TopBar, { type TopBarFilterMode } from './components/TopBar';
import { WindowCard } from './components/WindowCard';
import { windowStorage } from './utils/windowStorage';

interface TabsByWindow {
  [windowId: number]: Browser.tabs.Tab[];
}

export default function App({ isPopup }: { isPopup?: boolean }) {
  const [filterMode, setFilterMode] = useState<TopBarFilterMode>('managed');
  const [searchQuery, setSearchQuery] = useState('');

  const windowsQuery = useWindowsQuery();
  const tabsQuery = useTabsQuery();

  const currentWindowQuery = useSuspenseQuery({
    queryKey: ['currentWindow'],
    queryFn: () => browser.windows.getCurrent(),
  });

  const closedWindowsQuery = useSuspenseQuery({
    queryKey: ['closedWindows'],
    queryFn: () => windowStorage.getClosedWindows(),
  });
  const closedWindows = closedWindowsQuery.data;

  const managedWindowsQuery = useSuspenseQuery<number[]>({
    queryKey: ['managedWindows'],
    queryFn: async () => {
      const windows = await windowStorage.getManagedWindows();
      return windows;
    },
  });
  const managedWindowIds = managedWindowsQuery.data;

  // Group tabs by window
  const tabsByWindow = useMemo(() => {
    const grouped: TabsByWindow = {};
    tabsQuery.data.forEach((tab) => {
      const windowId = tab.windowId;
      if (typeof windowId === 'number') {
        if (!(windowId in grouped)) {
          grouped[windowId] = [];
        }
        grouped[windowId].push(tab);
      }
    });
    return grouped;
  }, [tabsQuery.data]);

  // Filter tabs based on search query
  const getFilteredTabs = <T extends { title?: string; url?: string }>(
    tabs: T[],
  ): T[] => {
    if (!searchQuery) return tabs;

    const lowerQuery = searchQuery.toLowerCase();
    return tabs.filter(
      (tab) =>
        tab.title?.toLowerCase().includes(lowerQuery) ||
        tab.url?.toLowerCase().includes(lowerQuery),
    );
  };

  const handleTabClick = (tabId: number) => focusTab(tabId);

  const handleCloseWindow = async (windowId: number) => {
    // Get all tabs for the window
    const tabs = await browser.tabs.query({ windowId });

    // Don't save empty windows
    if (tabs.length === 0) return;

    // Save window data to storage
    await windowStorage.saveClosedWindow({
      originalWindowId: windowId,
      tabs: tabs.map((tab) => ({
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl,
      })),
      closedAt: new Date(),
    });

    // Remove from managed windows if it was managed
    await windowStorage.removeManagedWindow(windowId);

    // Close the window
    await browser.windows.remove(windowId);

    // Update local state
    await Promise.all([
      windowsQuery.refetch(),
      closedWindowsQuery.refetch(),
      managedWindowsQuery.refetch(),
    ]);
  };

  const handleRestoreWindow = async (closedWindowId: string) => {
    const closedWindow = closedWindows.find((w) => w.id === closedWindowId);
    if (!closedWindow) return;

    // Extract URLs from tabs
    const urls = closedWindow.tabs
      .map((tab) => tab.url)
      .filter((url): url is string => typeof url === 'string');

    if (urls.length === 0) return;

    // Create new window with all tabs
    await browser.windows.create({ url: urls });

    // Remove from storage
    await windowStorage.removeClosedWindow(closedWindowId);

    // Update local state
    await Promise.all([windowsQuery.refetch(), closedWindowsQuery.refetch()]);
  };

  const handleManageWindow = async (windowId: number) => {
    // Get all tabs for the window
    const tabs = await browser.tabs.query({ windowId });
    const tabIds = tabs
      .map((tab) => tab.id)
      .filter((id): id is number => typeof id === 'number');

    if (tabIds.length === 0) return;

    // Group all tabs in the window
    const groupId = await browser.tabs.group({
      tabIds: tabIds as [number, ...number[]],
    });

    // Collapse the tab group
    void browser.tabGroups.update(groupId, { collapsed: true });

    // Save window ID to storage
    await windowStorage.saveManagedWindow(windowId);

    // Update local state
    await Promise.all([
      windowsQuery.refetch(),
      tabsQuery.refetch(),
      managedWindowsQuery.refetch(),
    ]);
  };

  const handleUnmanageWindow = async (windowId: number) => {
    // Get all tabs for the window
    const tabs = await browser.tabs.query({ windowId });

    // Ungroup all tabs that are in a group
    for (const tab of tabs) {
      if (tab.id && tab.groupId !== -1) {
        await browser.tabs.ungroup(tab.id);
      }
    }

    // Remove window ID from storage
    await windowStorage.removeManagedWindow(windowId);

    // Update local state
    await Promise.all([
      windowsQuery.refetch(),
      tabsQuery.refetch(),
      managedWindowsQuery.refetch(),
    ]);
  };

  const handleOpenSidePanel = openSidePanel;

  return (
    <div className="flex h-full flex-col">
      {/* Top Bar */}
      <TopBar
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSidePanelButton={isPopup}
        onOpenSidePanel={handleOpenSidePanel}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Managed Windows */}
        {filterMode === 'managed' && (
          <div className="flex flex-col gap-6">
            {windowsQuery.data.some((window) => {
              const windowId = window.id;
              if (typeof windowId !== 'number') return false;
              if (!managedWindowIds.includes(windowId)) return false;
              const allTabs = tabsByWindow[windowId] ?? [];
              return getFilteredTabs(allTabs).length > 0;
            }) ? (
              windowsQuery.data.map((window) => {
                const windowId = window.id;
                if (typeof windowId !== 'number') return null;
                if (!managedWindowIds.includes(windowId)) return null;

                const isCurrentWindow = windowId === currentWindowQuery.data.id;

                const allTabs = tabsByWindow[windowId] ?? [];
                const filteredTabs = getFilteredTabs(allTabs);
                if (filteredTabs.length === 0) return null;

                return (
                  <WindowCard
                    key={windowId}
                    title={`Window ${windowId}${isCurrentWindow ? ' (Current)' : ''}`}
                    tabCount={filteredTabs.length}
                    tabs={filteredTabs}
                    isHighlighted={isCurrentWindow}
                    actions={
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            void handleUnmanageWindow(windowId);
                          }}
                        >
                          <FolderOutput />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            void handleCloseWindow(windowId);
                          }}
                        >
                          <XIcon />
                        </Button>
                      </>
                    }
                    onTabClick={(index) => {
                      const tabId = filteredTabs[index]?.id;
                      if (typeof tabId === 'number') {
                        void handleTabClick(tabId);
                      }
                    }}
                  />
                );
              })
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {searchQuery ? 'No tabs found' : 'No managed windows yet'}
              </div>
            )}
          </div>
        )}

        {/* Unmanaged Windows (Open Windows + Closed Windows) */}
        {filterMode === 'unmanaged' && (
          <div className="flex flex-col gap-6">
            {/* Open Unmanaged Windows */}
            {windowsQuery.data.map((window) => {
              const windowId = window.id;
              if (typeof windowId !== 'number') return null;
              if (managedWindowIds.includes(windowId)) return null;

              const isCurrentWindow = windowId === currentWindowQuery.data.id;

              const allTabs = tabsByWindow[windowId] ?? [];
              const filteredTabs = getFilteredTabs(allTabs);
              if (filteredTabs.length === 0) return null;

              return (
                <WindowCard
                  key={windowId}
                  title={`Window ${windowId}${isCurrentWindow ? ' (Current)' : ''}`}
                  tabCount={filteredTabs.length}
                  tabs={filteredTabs}
                  isHighlighted={isCurrentWindow}
                  actions={
                    <Button
                      variant="default"
                      size="icon"
                      onClick={() => {
                        void handleManageWindow(windowId);
                      }}
                    >
                      <FolderInput />
                    </Button>
                  }
                  onTabClick={(index) => {
                    const tabId = filteredTabs[index]?.id;
                    if (typeof tabId === 'number') {
                      void handleTabClick(tabId);
                    }
                  }}
                />
              );
            })}

            {/* Closed Windows */}
            {closedWindows.map((closedWindow) => {
              const filteredTabs = getFilteredTabs(closedWindow.tabs);
              if (filteredTabs.length === 0) return null;

              const title = closedWindow.originalWindowId
                ? `Closed Window (was ${closedWindow.originalWindowId})`
                : 'Closed Window';

              return (
                <WindowCard
                  key={closedWindow.id}
                  title={title}
                  tabCount={filteredTabs.length}
                  tabs={filteredTabs}
                  isClosed={true}
                  actions={
                    <Button
                      variant="default"
                      size="icon"
                      onClick={() => {
                        void handleRestoreWindow(closedWindow.id);
                      }}
                    >
                      <RotateCcw />
                    </Button>
                  }
                />
              );
            })}

            {/* Empty state */}
            {windowsQuery.data.every((window) => {
              const windowId = window.id;
              if (typeof windowId !== 'number') return true;
              if (managedWindowIds.includes(windowId)) return true;
              const allTabs = tabsByWindow[windowId] ?? [];
              return getFilteredTabs(allTabs).length === 0;
            }) &&
              closedWindows.every(
                (w) => getFilteredTabs(w.tabs).length === 0,
              ) && (
                <div className="py-8 text-center text-muted-foreground">
                  {searchQuery ? 'No tabs found' : 'No unmanaged windows'}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

async function openSidePanel() {
  const currentWindow = await browser.windows.getCurrent();
  if (!currentWindow.id) return;
  await browser.sidePanel.open({ windowId: currentWindow.id });
}

async function focusTab(tabId: number) {
  await browser.tabs.update(tabId, { active: true });
  const tab = await browser.tabs.get(tabId);
  await browser.windows.update(tab.windowId, { focused: true });
}
