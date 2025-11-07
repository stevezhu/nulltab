import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@workspace/shadcn/components/button';
import { RotateCcw, XIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { type Browser, browser } from 'wxt/browser';

import { windowStorage } from '../utils/windowStorage';
import { WindowCard } from './WindowCard';

interface TabsByWindow {
  [windowId: number]: Browser.tabs.Tab[];
}

export default function App({ isPopup }: { isPopup?: boolean }) {
  const tabsQuery = useTabsSuspenseQuery();

  const windowsQuery = useWindowsSuspenseQuery();

  const currentWindowQuery = useSuspenseQuery({
    queryKey: ['currentWindow'],
    queryFn: () => browser.windows.getCurrent(),
  });

  const closedWindowsQuery = useSuspenseQuery({
    queryKey: ['closedWindows'],
    queryFn: () => windowStorage.getClosedWindows(),
  });
  const closedWindows = closedWindowsQuery.data;

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

  const handleTabClick = async (tabId: number) => {
    await browser.tabs.update(tabId, { active: true });
    const tab = await browser.tabs.get(tabId);
    await browser.windows.update(tab.windowId, { focused: true });
  };

  const handleCloseWindow = async (windowId: number) => {
    // // Get all tabs for the window
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

    // Close the window
    await browser.windows.remove(windowId);

    // Update local state
    await Promise.all([windowsQuery.refetch(), closedWindowsQuery.refetch()]);
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

  return (
    <div className="overflow-y-auto p-4">
      <h1 className="mb-4 text-2xl font-semibold">Tab Manager</h1>
      {isPopup && (
        <div className="mb-4">
          <Button
            onClick={async () => {
              const currentWindow = await browser.windows.getCurrent();
              if (!currentWindow.id) return;
              await browser.sidePanel.open({ windowId: currentWindow.id });
            }}
          >
            Open side panel
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-6">
        {windowsQuery.data.map((window) => {
          const windowId = window.id;
          if (typeof windowId !== 'number') return null;

          const isCurrentWindow = windowId === currentWindowQuery.data.id;

          const tabs = tabsByWindow[windowId] ?? [];
          if (tabs.length === 0) return null;

          return (
            <WindowCard
              key={windowId}
              title={`Window ${windowId}${isCurrentWindow ? ' (Current)' : ''}`}
              tabCount={tabs.length}
              tabs={tabs}
              isHighlighted={isCurrentWindow}
              actionButton={{
                icon: <XIcon />,
                variant: 'destructive',
                onClick: () => {
                  console.log('windowId', windowId);
                  void handleCloseWindow(windowId);
                },
              }}
              onTabClick={(index) => {
                const tabId = tabs[index]?.id;
                if (typeof tabId === 'number') {
                  void handleTabClick(tabId);
                }
              }}
            />
          );
        })}
      </div>

      {/* Closed Windows Section */}
      {closedWindows.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
            Closed Windows ({closedWindows.length})
          </h2>
          <div className="flex flex-col gap-6">
            {closedWindows.map((closedWindow) => {
              const title = closedWindow.originalWindowId
                ? `Closed Window (was ${closedWindow.originalWindowId})`
                : 'Closed Window';

              return (
                <WindowCard
                  key={closedWindow.id}
                  title={title}
                  tabCount={closedWindow.tabs.length}
                  tabs={closedWindow.tabs}
                  isClosed={true}
                  actionButton={{
                    icon: <RotateCcw />,
                    variant: 'default',
                    onClick: () => {
                      void handleRestoreWindow(closedWindow.id);
                    },
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function useWindowsSuspenseQuery() {
  const windowsQuery = useSuspenseQuery({
    queryKey: ['windows'],
    queryFn: () => browser.windows.getAll({}),
  });

  useEffect(() => {
    const handleRefetch = () => void windowsQuery.refetch();

    browser.windows.onFocusChanged.addListener(handleRefetch);
    return () => {
      browser.windows.onFocusChanged.removeListener(handleRefetch);
    };
  }, [windowsQuery]);

  return windowsQuery;
}

function useTabsSuspenseQuery() {
  const tabsQuery = useSuspenseQuery({
    queryKey: ['tabs'],
    queryFn: () => browser.tabs.query({}),
  });

  useEffect(() => {
    const handleRefetch = () => void tabsQuery.refetch();

    browser.tabs.onCreated.addListener(handleRefetch);
    browser.tabs.onUpdated.addListener(handleRefetch);
    browser.tabs.onRemoved.addListener(handleRefetch);
    browser.tabs.onMoved.addListener(handleRefetch);
    browser.tabs.onActivated.addListener(handleRefetch);

    return () => {
      browser.tabs.onCreated.removeListener(handleRefetch);
      browser.tabs.onUpdated.removeListener(handleRefetch);
      browser.tabs.onRemoved.removeListener(handleRefetch);
      browser.tabs.onMoved.removeListener(handleRefetch);
      browser.tabs.onActivated.removeListener(handleRefetch);
    };
  }, [tabsQuery]);

  return tabsQuery;
}
