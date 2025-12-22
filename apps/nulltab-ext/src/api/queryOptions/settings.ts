import { queryOptions } from '@tanstack/react-query';

import { getSettings } from '#api/storage/settingsStorage.js';

export const settingsKeys = {
  root: ['settings'] as const,
  all: () => [...settingsKeys.root, 'all'] as const,
};

export const settingsQueryOptions = queryOptions({
  queryKey: settingsKeys.all(),
  queryFn: () => getSettings(),
});
