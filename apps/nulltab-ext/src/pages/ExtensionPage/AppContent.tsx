import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useElementScrollRestoration } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import { createProxyService } from '@webext-core/proxy-service';
import { Button } from '@workspace/shadcn/components/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/shadcn/components/empty';
import { cn } from '@workspace/shadcn/lib/utils';
import { Inbox, Search, Tag } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { type Browser, browser } from 'wxt/browser';

import { TABS_SERVICE_KEY } from '#api/proxyService/proxyServiceKeys.js';
import { mainTabGroupQueryOptions } from '#api/queryOptions/mainTabGroup.js';
import {
  sortedTabsQueryOptions,
  tabsKeys,
  tabsQueryOptions,
} from '#api/queryOptions/tabs.js';
import {
  tabAssignmentsQueryOptions,
  topicsKeys,
  topicsQueryOptions,
} from '#api/queryOptions/topics.js';
import {
  currentWindowQueryOptions,
  windowsKeys,
  windowsQueryOptions,
} from '#api/queryOptions/windows.js';
import { topicStorage } from '#api/storage/topicStorage.js';
import { TopicFilterValue } from '#components/TopicsBar.js';
import {
  WindowCard,
  WindowCardTab,
  WindowCardTabs,
} from '#components/WindowCard.js';
import { WindowCardList } from '#components/WindowCardList.js';
import { TabTopicAssignments } from '#models/index.js';
import { convertTabToTabData } from '#utils/tabs.js';

function createSearchFilter(searchQuery: string) {
  const lowerQuery = searchQuery.toLowerCase();
  return (tab: Browser.tabs.Tab): boolean => {
    return (
      tab.title?.toLowerCase().includes(lowerQuery) ||
      tab.url?.toLowerCase().includes(lowerQuery) ||
      false
    );
  };
}

function createTopicFilter({
  selectedTopic,
  tabAssignments,
}: {
  selectedTopic: TopicFilterValue;
  tabAssignments: TabTopicAssignments;
}) {
  return (tab: Browser.tabs.Tab): boolean => {
    if (selectedTopic === 'all') {
      return true;
    }
    if (selectedTopic === 'uncategorized') {
      return !tab.url || !tabAssignments[tab.url];
    }
    return !!tab.url && tabAssignments[tab.url] === selectedTopic;
  };
}

const tabsService = createProxyService(TABS_SERVICE_KEY);

export type UngroupedTabsWindowListProps = {
  className?: string;
  searchValue: string;
};

export function UngroupedTabWindowList({
  className,
  searchValue,
}: UngroupedTabsWindowListProps) {
  const queryClient = useQueryClient();

  const { data: currentWindow } = useSuspenseQuery(currentWindowQueryOptions);
  const { data: windows } = useSuspenseQuery(windowsQueryOptions);
  const ungroupedTabs = useSuspenseQueries({
    queries: [tabsQueryOptions, mainTabGroupQueryOptions],
    combine: ([tabsQuery, mainTabGroupQuery]) => {
      const mainTabGroup = mainTabGroupQuery.data;
      const ungroupedTabs = tabsQuery.data.filter(
        (tab) => tab.id && mainTabGroup?.windowId !== tab.windowId,
      );
      return ungroupedTabs;
    },
  });
  const filteredTabDataList = useMemo(() => {
    const searchFilter = createSearchFilter(searchValue);
    return ungroupedTabs.filter(searchFilter).map(convertTabToTabData);
  }, [ungroupedTabs, searchValue]);

  return (
    <div className={cn('overflow-y-auto p-4', className)}>
      <WindowCardList
        windows={windows}
        tabs={filteredTabDataList}
        currentWindowId={currentWindow.id}
        onManageWindow={async ({ windowId }: { windowId: number }) => {
          await tabsService.manageWindow({ windowId });

          // Update local state
          // TODO: use mutation, invalidate queries instead of refetching
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: windowsKeys.root }),
            queryClient.invalidateQueries({ queryKey: tabsKeys.root }),
          ]);
        }}
        onTabClick={({ tabId }: { tabId: number }) => {
          void tabsService.switchTab({ tabId });
        }}
        emptyMessage="No tabs found"
      />
    </div>
  );
}

export type AllTabsProps = {
  className?: string;
  searchValue: string;
  selectedTopic: TopicFilterValue;
  onSelectTopic: (topic: TopicFilterValue) => void;
};

export function AllTabs({
  className,
  searchValue,
  selectedTopic,
  onSelectTopic,
}: AllTabsProps) {
  const queryClient = useQueryClient();

  const assignTabToTopic = useMutation({
    mutationFn: async ({
      tabUrl,
      topicId,
    }: {
      tabUrl: string;
      topicId: string | null;
    }) => {
      if (topicId === null) {
        await topicStorage.removeTabAssignment(tabUrl);
      } else {
        await topicStorage.assignTabToTopic(tabUrl, topicId);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: topicsKeys.assignments(),
      });
    },
  });

  const { data: topics } = useSuspenseQuery(topicsQueryOptions);
  const { data: tabAssignments } = useSuspenseQuery(tabAssignmentsQueryOptions);

  const { data: currentWindow } = useSuspenseQuery(currentWindowQueryOptions);
  const { data: mainTabGroup } = useSuspenseQuery(mainTabGroupQueryOptions);

  const { data: sortedTabs } = useSuspenseQuery(sortedTabsQueryOptions);
  const filteredTabs = useMemo(() => {
    const searchFilter = createSearchFilter(searchValue);
    const topicFilter = createTopicFilter({ selectedTopic, tabAssignments });
    return sortedTabs.filter((tab) =>
      [searchFilter, topicFilter].every((filter) => filter(tab)),
    );
  }, [sortedTabs, searchValue, selectedTopic, tabAssignments]);

  // Virtualizer
  const scrollRestorationId = 'myVirtualizedContent';
  const scrollEntry = useElementScrollRestoration({
    id: scrollRestorationId,
  });
  const virtualizerScrollElRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filteredTabs.length,
    getScrollElement: () => virtualizerScrollElRef.current,
    estimateSize: () => 61,
    initialOffset: scrollEntry?.scrollY,
  });
  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      className={cn('overflow-y-auto p-4', className)}
      ref={virtualizerScrollElRef}
      data-scroll-restoration-id={scrollRestorationId}
    >
      {filteredTabs.length === 0 ? (
        <AllTabsEmpty
          searchValue={searchValue}
          selectedTopic={selectedTopic}
          currentTopicName={topics.find((t) => t.id === selectedTopic)?.name}
          onSelectTopic={onSelectTopic}
        />
      ) : (
        <WindowCard>
          <WindowCardTabs
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
              }}
            >
              {virtualItems.map((virtualItem) => {
                const tab = filteredTabs[virtualItem.index];
                if (!tab) return null;
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                  >
                    <WindowCardTab
                      title={tab.title}
                      url={tab.url}
                      active={tab.active && tab.windowId === currentWindow.id}
                      lastAccessed={tab.lastAccessed}
                      discarded={tab.discarded}
                      topics={topics}
                      currentTopicId={
                        tab.url ? tabAssignments[tab.url] : undefined
                      }
                      onTopicChange={(topicId) => {
                        if (!tab.url) return;
                        assignTabToTopic.mutate({ tabUrl: tab.url, topicId });
                      }}
                      onClick={() => {
                        if (
                          !tab.id ||
                          !mainTabGroup?.id ||
                          !mainTabGroup.windowId
                        )
                          return;
                        void tabsService.switchTab({
                          mainTabGroupId: mainTabGroup.id,
                          mainWindowId: mainTabGroup.windowId,
                          tabId: tab.id,
                        });
                      }}
                      onClose={() => {
                        if (!tab.id) return;
                        void browser.tabs.remove(tab.id);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </WindowCardTabs>
        </WindowCard>
      )}
    </div>
  );
}

function AllTabsEmpty({
  searchValue,
  selectedTopic,
  currentTopicName,
  onSelectTopic,
}: {
  searchValue: string;
  selectedTopic: TopicFilterValue;
  currentTopicName?: string;
  onSelectTopic: (topic: TopicFilterValue) => void;
}) {
  const isSearching = searchValue.length > 0;
  const isFilteringByTopic =
    selectedTopic !== 'all' && selectedTopic !== 'uncategorized';
  const isFilteringUncategorized = selectedTopic === 'uncategorized';
  if (isSearching) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search />
          </EmptyMedia>
          <EmptyTitle>No matching tabs</EmptyTitle>
          <EmptyDescription>
            No tabs match &quot;{searchValue}&quot;. Try a different search
            term.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (isFilteringByTopic && currentTopicName !== undefined) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Tag />
          </EmptyMedia>
          <EmptyTitle>No tabs in &quot;{currentTopicName}&quot;</EmptyTitle>
          <EmptyDescription>
            Assign tabs to this topic using the dropdown menu on any tab.
          </EmptyDescription>
        </EmptyHeader>
        <Button
          variant="outline"
          onClick={() => {
            onSelectTopic('all');
          }}
        >
          View all tabs
        </Button>
      </Empty>
    );
  }

  if (isFilteringUncategorized) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>All tabs are categorized</EmptyTitle>
          <EmptyDescription>
            Great job! All your tabs have been assigned to topics.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>No tabs</EmptyTitle>
        <EmptyDescription>
          No tabs are available right now. Open a tab or adjust your filters.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
