import { useSuspenseQuery } from '@tanstack/react-query';
import { cn } from '@workspace/shadcn/lib/utils';
import { useMemo } from 'react';
import { browser } from 'wxt/browser';

interface Tab {
  id?: number;
  windowId?: number;
  title?: string;
  url?: string;
  favIconUrl?: string;
  active?: boolean;
}

interface Window {
  id?: number;
  focused?: boolean;
}

interface TabsByWindow {
  [windowId: number]: Tab[];
}

function getHostname(url: string | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export default function App() {
  const tabsQuery = useTabsSuspenseQuery();

  const windowsQuery = useWindowsSuspenseQuery();

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

  return (
    <div className="overflow-y-auto p-4">
      <h1 className="mb-4 text-left text-2xl font-semibold">Tab Manager</h1>
      <div className="flex flex-col gap-6">
        {windowsQuery.data.map((window: Window) => {
          const windowId = window.id;
          if (typeof windowId !== 'number') return null;

          const tabs = tabsByWindow[windowId] ?? [];
          return (
            <div
              key={windowId}
              className={`
                overflow-hidden rounded-lg border border-border bg-card/50
              `}
            >
              <div
                className={`
                  flex items-center justify-between border-b border-border
                  bg-muted/50 px-4 py-3
                `}
              >
                <h2 className="text-base font-semibold">
                  Window {windowId}
                  {window.focused === true ? ' (Current)' : ''}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {tabs.length} tabs
                </span>
              </div>
              <div className="flex flex-col">
                {tabs.map((tab: Tab) => {
                  console.log(tab.favIconUrl);
                  const tabId = tab.id;
                  if (typeof tabId !== 'number') return null;

                  return (
                    <div
                      key={tabId}
                      className={cn(
                        `
                          flex cursor-pointer items-center gap-3 border-b
                          border-border px-4 py-3 transition-colors
                          last:border-b-0
                          hover:bg-blue-50
                        `,
                        tab.active &&
                          `
                            border-l-4 border-l-blue-500 bg-blue-100
                            pl-[calc(1rem-4px)]
                          `,
                      )}
                      onClick={() => {
                        void handleTabClick(tabId);
                      }}
                    >
                      {/* TODO: ignore chrome-extension:// urls? they don't seem to be accessible */}
                      {tab.favIconUrl && (
                        <img
                          src={tab.favIconUrl}
                          alt=""
                          className="h-4 w-4 shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1 text-left">
                        <div className="truncate text-sm font-medium">
                          {tab.title || 'Untitled'}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {getHostname(tab.url)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
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
