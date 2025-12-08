import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { browser } from 'wxt/browser';

import { windowsKeys } from '#api/queryOptions/windows.js';

export function useWindowsListeners() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleRefetch = () =>
      void queryClient.invalidateQueries({ queryKey: windowsKeys.root });

    browser.windows.onFocusChanged.addListener(handleRefetch);
    return () => {
      browser.windows.onFocusChanged.removeListener(handleRefetch);
    };
  }, [queryClient]);
}
