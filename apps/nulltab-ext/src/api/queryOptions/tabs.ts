import { queryOptions } from '@tanstack/react-query';
import { browser } from 'wxt/browser';

import { sortTabs } from '#utils/tabs.js';

export const tabsKeys = {
  root: ['tabs'] as const,
};

export const tabsQueryOptions = queryOptions({
  queryKey: tabsKeys.root,
  queryFn: () => browser.tabs.query({}),
});

export const sortedTabsQueryOptions = queryOptions({
  queryKey: tabsKeys.root,
  queryFn: () => browser.tabs.query({}),
  select: (tabs) => sortTabs(tabs),
});
