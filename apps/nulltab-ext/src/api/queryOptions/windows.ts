import { queryOptions } from '@tanstack/react-query';
import { type Browser, browser } from 'wxt/browser';

import { windowStorage } from '#api/storage/windowStorage.js';

export const windowsKeys = {
  root: ['windows'] as const,
};

export const windowsQueryOptions = queryOptions({
  queryKey: windowsKeys.root,
  queryFn: async () => {
    return {
      managedWindowIds: await windowStorage.getManagedWindows(),
      windows: await browser.windows.getAll({}),
    };
  },
  select: ({ managedWindowIds, windows }) => {
    const managedWindows: Browser.windows.Window[] = [];
    const unmanagedWindows: Browser.windows.Window[] = [];
    for (const window of windows) {
      if (!window.id) continue;
      if (managedWindowIds.includes(window.id)) {
        managedWindows.push(window);
      } else {
        unmanagedWindows.push(window);
      }
    }
    return {
      managedWindows,
      unmanagedWindows,
      managedWindowIds: new Set(managedWindowIds),
    };
  },
});
