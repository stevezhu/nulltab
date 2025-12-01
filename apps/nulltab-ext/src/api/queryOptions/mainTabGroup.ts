import { queryOptions } from '@tanstack/react-query';

import { getMainTabGroup } from '#utils/management.js';

export const mainTabGroupQueryOptions = queryOptions({
  queryKey: ['mainTabGroup'],
  queryFn: () => getMainTabGroup(),
});
