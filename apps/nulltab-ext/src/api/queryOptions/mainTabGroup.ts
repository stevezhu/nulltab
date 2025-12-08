import { queryOptions } from '@tanstack/react-query';

import { getMainTabGroup } from '#utils/management.js';

export const mainTabGroupKeys = {
  root: ['mainTabGroup'] as const,
};

export const mainTabGroupQueryOptions = queryOptions({
  queryKey: mainTabGroupKeys.root,
  queryFn: () => getMainTabGroup(),
});
