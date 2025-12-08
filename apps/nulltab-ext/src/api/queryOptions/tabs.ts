import { queryOptions } from '@tanstack/react-query';
import { browser } from 'wxt/browser';

export const tabsKeys = {
  root: ['tabs'] as const,
};

export const tabsQueryOptions = queryOptions({
  queryKey: tabsKeys.root,
  queryFn: () => browser.tabs.query({}),
});
