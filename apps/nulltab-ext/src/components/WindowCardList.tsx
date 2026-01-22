import { Button } from '@workspace/shadcn/components/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/shadcn/components/empty';
import { FolderInput, Sparkles } from 'lucide-react';
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
 * Used to display ungrouped open tabs.
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
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>All tabs are grouped</EmptyTitle>
          <EmptyDescription>
            {emptyMessage ??
              'No ungrouped tabs right now. Switch to "All" to see your other tabs.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {windows.map((window) => {
        const windowId = window.id;
        if (!windowId) return null;

        const tabs = tabsByWindow.get(windowId) ?? [];
        if (tabs.length === 0) return null;

        const isCurrentWindow = windowId === currentWindowId;
        return (
          <WindowCard key={windowId} active={isCurrentWindow}>
            <WindowCardHeader
              title={`Window ${windowId}${isCurrentWindow ? ' (Current)' : ''}`}
              tabCount={tabs.length}
            >
              <div className="flex gap-2">
                <>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => {
                      onManageWindow({ windowId });
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
                    active={'active' in tab ? tab.active : undefined}
                    lastAccessed={tab.lastAccessed}
                    discarded={tab.discarded}
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
