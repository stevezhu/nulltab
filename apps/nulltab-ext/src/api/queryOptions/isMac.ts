import { queryOptions } from '@tanstack/react-query';

import { isMac } from '#utils/os.js';

export const isMacKeys = {
  isMac: ['isMac'] as const,
};

export const isMacQueryOptions = queryOptions({
  queryKey: isMacKeys.isMac,
  queryFn: () => isMac(),
});
