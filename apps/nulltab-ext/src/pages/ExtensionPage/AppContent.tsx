import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createProxyService } from '@webext-core/proxy-service';
import { Button } from '@workspace/shadcn/components/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/shadcn/components/empty';
import { Inbox, Search, Tag } from 'lucide-react';
import { useMemo } from 'react';
import { type Browser, browser } from 'wxt/browser';

import { TABS_SERVICE_KEY } from '#api/proxyService/proxyServiceKeys.js';
import { mainTabGroupQueryOptions } from '#api/queryOptions/mainTabGroup.js';
import { tabsQueryOptions } from '#api/queryOptions/tabs.js';
import {
  tabAssignmentsQueryOptions,
  topicsKeys,
  topicsQueryOptions,
} from '#api/queryOptions/topics.js';
import { windowsQueryOptions } from '#api/queryOptions/windows.js';
import { topicStorage } from '#api/storage/topicStorage.js';
import { type TopBarFilterMode } from '#components/TopBar.js';
import { TopicFilterValue } from '#components/TopicsBar.js';
import {
  WindowCard,
  WindowCardTab,
  WindowCardTabs,
} from '#components/WindowCard.js';
import { WindowCardList } from '#components/WindowCardList.js';
import { TabTopicAssignments, WindowData } from '#models/index.js';
import { convertTabToTabData, sortTabs } from '#utils/tabs.js';

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

export function AppContent({
  filterMode,
  searchValue,
  selectedTopic,
  onSelectTopic,
}: {
  filterMode: TopBarFilterMode;
  searchValue: string;
  selectedTopic: TopicFilterValue;
  onSelectTopic: (topic: TopicFilterValue) => void;
}) {
  const queryClient = useQueryClient();
  const tabsQuery = useSuspenseQuery(tabsQueryOptions);
  const windowsQuery = useSuspenseQuery(windowsQueryOptions);
  const { managedWindows, unmanagedWindows } = windowsQuery.data;

  const { data: topics } = useSuspenseQuery(topicsQueryOptions);
  const { data: tabAssignments } = useSuspenseQuery(tabAssignmentsQueryOptions);

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

  const filteredTabs = useMemo(() => {
    const searchFilter = createSearchFilter(searchValue);
    const topicFilter = createTopicFilter({ selectedTopic, tabAssignments });
    return tabsQuery.data.filter((tab) =>
      [searchFilter, topicFilter].every((filter) => filter(tab)),
    );
  }, [tabsQuery.data, searchValue, selectedTopic, tabAssignments]);

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
          await tabsService.manageWindow({ windowId });

          // Update local state
          // TODO: use mutation, invalidate queries instead of refetching
          await Promise.all([windowsQuery.refetch(), tabsQuery.refetch()]);
        }}
        onTabClick={({ tabId }: { tabId: number }) => {
          void tabsService.switchTab({ tabId });
        }}
        emptyMessage="No tabs found"
      />
    );
  }
  if (managedTabs.length === 0) {
    // Determine the empty state context
    const isSearching = searchValue.length > 0;
    const isFilteringByTopic =
      selectedTopic !== 'all' && selectedTopic !== 'uncategorized';
    const isFilteringUncategorized = selectedTopic === 'uncategorized';
    const currentTopicName = isFilteringByTopic
      ? topics.find((t) => t.id === selectedTopic)?.name
      : null;

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

    if (isFilteringByTopic) {
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

    // Default: no managed tabs at all
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>No managed tabs</EmptyTitle>
          <EmptyDescription>
            Switch to &quot;Unmanaged&quot; to see your open tabs and start
            managing them.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
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
              topics={topics}
              currentTopicId={tab.url ? tabAssignments[tab.url] : undefined}
              onTopicChange={(topicId) => {
                if (!tab.url) return;
                assignTabToTopic.mutate({ tabUrl: tab.url, topicId });
              }}
              onClick={() => {
                if (!tab.id || !mainTabGroup?.id || !mainTabGroup.windowId)
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
          );
        })}
      </WindowCardTabs>
    </WindowCard>
  );
}
