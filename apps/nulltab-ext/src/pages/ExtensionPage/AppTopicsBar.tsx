import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Dispatch, SetStateAction, useMemo } from 'react';

import { mainTabGroupQueryOptions } from '#api/queryOptions/mainTabGroup.js';
import { tabsQueryOptions } from '#api/queryOptions/tabs.js';
import {
  tabAssignmentsQueryOptions,
  topicsKeys,
  topicsQueryOptions,
} from '#api/queryOptions/topics.js';
import { topicStorage } from '#api/storage/topicStorage.js';
import {
  type TopicCounts,
  TopicFilterValue,
  TopicsBar,
} from '#components/TopicsBar.js';

export function AppTopicsBar({
  selectedTopic,
  setSelectedTopic,
}: {
  selectedTopic: TopicFilterValue;
  setSelectedTopic: Dispatch<SetStateAction<TopicFilterValue>>;
}) {
  const queryClient = useQueryClient();

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
  );
}
