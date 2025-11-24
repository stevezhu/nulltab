import { Button } from '@workspace/shadcn/components/button';
import { FolderInput } from 'lucide-react';
import { ReactNode, useMemo } from 'react';

import { TabData, WindowData } from '#models/index.js';

import {
  WindowCard,
  WindowCardHeader,
  WindowCardTab,
  WindowCardTabs,
} from './WindowCard';

export type WindowCardListProps = {
  windows: WindowData[];
  tabs: TabData[];
  currentWindowId?: number;
  emptyMessage?: ReactNode;
  onManageWindow: ({ windowId }: { windowId: number }) => void;
  onTabClick: ({ tabId }: { tabId: number }) => void;
};

/**
 * Used to display unmanaged open tabs.
 * @param props
 * @returns
 */
export function WindowCardList({
  windows,
  tabs,
  currentWindowId,
  emptyMessage,
  onManageWindow,
  onTabClick,
}: WindowCardListProps) {
  const tabsByWindow = useMemo(() => {
    const tabsByWindow = new Map<number, TabData[]>();
    for (const tab of tabs) {
      if (!tabsByWindow.has(tab.windowId)) {
        tabsByWindow.set(tab.windowId, []);
      }
      tabsByWindow.get(tab.windowId)?.push(tab);
    }
    return tabsByWindow;
  }, [tabs]);

  const isEmpty = tabsByWindow.size === 0;
  if (isEmpty) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {windows.map((window) => {
        if (!window.id) return null;

        const tabs = tabsByWindow.get(window.id) ?? [];
        if (tabs.length === 0) return null;

        const isCurrentWindow = window.id === currentWindowId;
        return (
          <WindowCard key={window.id} active={isCurrentWindow}>
            <WindowCardHeader
              title={`Window ${window.id}${isCurrentWindow ? ' (Current)' : ''}`}
              tabCount={tabs.length}
            >
              <div className="flex gap-2">
                <>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => {
                      onManageWindow({ windowId: window.id });
                    }}
                  >
                    <FolderInput />
                  </Button>
                </>
              </div>
            </WindowCardHeader>
            <WindowCardTabs>
              {tabs.map((tab) => {
                return (
                  <WindowCardTab
                    key={tab.id}
                    title={tab.title}
                    url={tab.url}
                    favIconUrl={tab.favIconUrl}
                    active={'active' in tab ? tab.active : undefined}
                    lastAccessed={tab.lastAccessed}
                    onClick={() => {
                      if (!tab.id) return;
                      onTabClick({ tabId: tab.id });
                    }}
                  />
                );
              })}
            </WindowCardTabs>
          </WindowCard>
        );
      })}
    </div>
  );
}
