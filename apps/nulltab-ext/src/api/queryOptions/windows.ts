import { queryOptions } from '@tanstack/react-query';
import { browser } from 'wxt/browser';

export const windowsKeys = {
  root: ['windows'] as const,
  current: ['currentWindow'] as const,
};

export const currentWindowQueryOptions = queryOptions({
  queryKey: windowsKeys.current,
  queryFn: () => browser.windows.getCurrent(),
});

export const windowsQueryOptions = queryOptions({
  queryKey: windowsKeys.root,
  queryFn: () => browser.windows.getAll({}),
});
