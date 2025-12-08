import { queryOptions } from '@tanstack/react-query';

import { topicStorage } from '#utils/topicStorage.js';

export const topicsKeys = {
  root: ['topics'] as const,
  list: () => [...topicsKeys.root, 'list'] as const,
  assignments: () => [...topicsKeys.root, 'assignments'] as const,
};

export const topicsQueryOptions = queryOptions({
  queryKey: topicsKeys.list(),
  queryFn: () => topicStorage.getTopics(),
});

export const tabAssignmentsQueryOptions = queryOptions({
  queryKey: topicsKeys.assignments(),
  queryFn: () => topicStorage.getTabAssignments(),
});
