import './App.css';

import { useSuspenseQuery } from '@tanstack/react-query';
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

export default function App() {
  const tabsQuery = useSuspenseQuery({
    queryKey: ['tabs'],
    queryFn: async () => {
      return (await browser.tabs.query({})) as Tab[];
    },
  });

  const windowsQuery = useSuspenseQuery({
    queryKey: ['windows'],
    queryFn: async () => {
      return (await browser.windows.getAll({})) as Window[];
    },
  });

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
  };

  const getHostname = (url: string | undefined): string => {
    if (!url) return '';
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  };

  return (
    <div className="app-container">
      <h1>Tab Manager</h1>
      <div className="windows-container">
        {windowsQuery.data.map((window: Window) => {
          const windowId = window.id;
          if (typeof windowId !== 'number') return null;

          const tabs = tabsByWindow[windowId] ?? [];
          return (
            <div key={windowId} className="window-section">
              <div className="window-header">
                <h2>
                  Window {windowId}
                  {window.focused === true ? ' (Current)' : ''}
                </h2>
                <span className="tab-count">{tabs.length} tabs</span>
              </div>
              <div className="tabs-list">
                {tabs.map((tab: Tab) => {
                  const tabId = tab.id;
                  if (typeof tabId !== 'number') return null;

                  return (
                    <div
                      key={tabId}
                      className={`
                        tab-item
                        ${tab.active === true ? 'active' : ''}
                      `}
                      onClick={() => {
                        void handleTabClick(tabId);
                      }}
                    >
                      {tab.favIconUrl && (
                        <img
                          src={tab.favIconUrl}
                          alt=""
                          className="tab-favicon"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="tab-info">
                        <div className="tab-title">
                          {tab.title || 'Untitled'}
                        </div>
                        <div className="tab-url">{getHostname(tab.url)}</div>
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
