import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { type Browser, browser } from 'wxt/browser';

import { windowStorage } from '#utils/windowStorage.js';

export function useWindowsQuery() {
  const windowsQuery = useSuspenseQuery({
    queryKey: ['windows'],
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

  useEffect(() => {
    const handleRefetch = () => void windowsQuery.refetch();

    browser.windows.onFocusChanged.addListener(handleRefetch);
    return () => {
      browser.windows.onFocusChanged.removeListener(handleRefetch);
    };
  }, [windowsQuery]);

  return windowsQuery;
}
