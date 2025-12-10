import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Button } from '@workspace/shadcn/components/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/shadcn/components/empty';
import { Inbox, Search, Tag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type Browser, browser } from 'wxt/browser';

import { mainTabGroupQueryOptions } from '#api/queryOptions/mainTabGroup.js';
import { tabsQueryOptions } from '#api/queryOptions/tabs.js';
import {
  tabAssignmentsQueryOptions,
  topicsKeys,
  topicsQueryOptions,
} from '#api/queryOptions/topics.js';
import { windowsQueryOptions } from '#api/queryOptions/windows.js';
import { topicStorage } from '#api/storage/topicStorage.js';
import { getTabService } from '#api/TabService.js';
import TopBar, {
  TopBarCommand,
  type TopBarFilterMode,
} from '#components/TopBar.js';
import {
  type TopicCounts,
  TopicFilterValue,
  TopicsBar,
} from '#components/TopicsBar.js';
import {
  WindowCard,
  WindowCardTab,
  WindowCardTabs,
} from '#components/WindowCard.js';
import { WindowCardList } from '#components/WindowCardList.js';
import { useTabsListeners } from '#hooks/useTabsListeners.js';
import { useWindowsListeners } from '#hooks/useWindowsListeners.js';
import { TabTopicAssignments, WindowData } from '#models/index.js';
import {
  convertTabToTabData,
  focusTab,
  manageWindow,
  openSidePanel,
  sortTabs,
} from '#utils/management.js';

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

const tabService = getTabService();

export default function App({ isPopup }: { isPopup?: boolean }) {
  useTabsListeners();
  useWindowsListeners();

  const [filterMode, setFilterMode] = useState<TopBarFilterMode>('managed');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<TopicFilterValue>('all');

  const queryClient = useQueryClient();
  const discardStaleTabs = useMutation({
    mutationFn: () => tabService.discardStaleTabs(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tabs'] });
    },
  });

  const discardAllGroupedTabs = useMutation({
    mutationFn: () => tabService.discardAllGroupedTabs(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tabs'] });
    },
  });

  const undoCloseTab = useMutation({
    mutationFn: async () => {
      await browser.sessions.restore();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tabs'] });
    },
  });

  const topicsQuery = useSuspenseQuery(topicsQueryOptions);
  const topics = topicsQuery.data;

  // Query data needed for topic counts
  const tabsQuery = useSuspenseQuery(tabsQueryOptions);
  const tabAssignmentsQuery = useSuspenseQuery(tabAssignmentsQueryOptions);
  const mainTabGroupQuery = useSuspenseQuery(mainTabGroupQueryOptions);

  // Compute topic counts from managed tabs
  const topicCounts = useMemo((): TopicCounts => {
    const mainTabGroup = mainTabGroupQuery.data;
    const tabAssignments = tabAssignmentsQuery.data;

    // Filter to managed tabs only
    const managedTabs = tabsQuery.data.filter(
      (tab) => tab.id && mainTabGroup?.windowId === tab.windowId,
    );

    let uncategorized = 0;
    const byTopic: Record<string, number> = {};

    // Initialize counts for all topics
    for (const topic of topics) {
      byTopic[topic.id] = 0;
    }

    // Count tabs by topic
    for (const tab of managedTabs) {
      const topicId = tab.url ? tabAssignments[tab.url] : undefined;
      if (topicId && byTopic[topicId] !== undefined) {
        byTopic[topicId]++;
      } else {
        uncategorized++;
      }
    }

    return {
      all: managedTabs.length,
      uncategorized,
      byTopic,
    };
  }, [
    tabsQuery.data,
    tabAssignmentsQuery.data,
    mainTabGroupQuery.data,
    topics,
  ]);

  const createTopic = useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      topicStorage.saveTopic(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: topicsKeys.root });
    },
  });

  const deleteTopic = useMutation({
    mutationFn: (id: string) => topicStorage.deleteTopic(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: topicsKeys.root });
      // Reset filter if the deleted topic was selected
      setSelectedTopic((current) =>
        current === 'all' || current === 'uncategorized' ? current : 'all',
      );
    },
  });

  const updateTopic = useMutation({
    mutationFn: (topic: { id: string; name: string; color?: string }) =>
      topicStorage.updateTopic(topic),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: topicsKeys.root });
    },
  });

  const reorderTopics = useMutation({
    mutationFn: (topicIds: string[]) => topicStorage.reorderTopics(topicIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: topicsKeys.root });
    },
  });

  return (
    <div className="flex h-full flex-col">
      {/* Reverse the markup order and use flex order to overlap correctly.
      The final element will be on top. */}

      {/* Content Area */}
      <div className="order-3 flex-1 overflow-y-auto p-4">
        <AppContent
          filterMode={filterMode}
          searchQuery={searchQuery.startsWith('/') ? '' : searchQuery}
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
        />
      </div>

      {/* Topic Tabs - only show in managed view */}
      {filterMode === 'managed' && (
        <div className="order-2">
          <TopicsBar
            topics={topics}
            counts={topicCounts}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            onCreateTopic={(name, color) => {
              createTopic.mutate({ name, color });
            }}
            onDeleteTopic={(id) => {
              deleteTopic.mutate(id);
            }}
            onUpdateTopic={(topic) => {
              updateTopic.mutate(topic);
            }}
            onReorderTopics={(topicIds) => {
              reorderTopics.mutate(topicIds);
            }}
          />
        </div>
      )}

      {/* Top Bar */}
      <div className="order-1">
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
                label: 'Undo Close Tab',
                onSelect: undoCloseTab.mutate,
              },
              {
                label: 'Suspend Stale Tabs',
                onSelect: discardStaleTabs.mutate,
              },
              {
                label: 'Suspend All Grouped Tabs',
                onSelect: discardAllGroupedTabs.mutate,
              },
            ]}
          />
        </TopBar>
      </div>
    </div>
  );
}

function AppContent({
  filterMode,
  searchQuery,
  selectedTopic,
  onSelectTopic,
}: {
  filterMode: TopBarFilterMode;
  searchQuery: string;
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
    const searchFilter = createSearchFilter(searchQuery);
    const topicFilter = createTopicFilter({ selectedTopic, tabAssignments });
    return tabsQuery.data.filter((tab) =>
      [searchFilter, topicFilter].every((filter) => filter(tab)),
    );
  }, [tabsQuery.data, searchQuery, selectedTopic, tabAssignments]);

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
        emptyMessage="No tabs found"
      />
    );
  }
  if (managedTabs.length === 0) {
    // Determine the empty state context
    const isSearching = searchQuery.length > 0;
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
              No tabs match &quot;{searchQuery}&quot;. Try a different search
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
                void tabService.openManagedTab({
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
