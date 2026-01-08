import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { browser } from 'wxt/browser';

import { tabsKeys } from '#api/queryOptions/tabs.js';

/**
 * Listeners to refetch the tabs query whenever tabs change.
 */
export function useTabsListeners() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleRefetch = () => {
      void queryClient.invalidateQueries({
        queryKey: tabsKeys.root,
      });
    };

    browser.tabs.onCreated.addListener(handleRefetch);
    browser.tabs.onUpdated.addListener(handleRefetch);
    browser.tabs.onRemoved.addListener(handleRefetch);
    browser.tabs.onMoved.addListener(handleRefetch);
    browser.tabs.onActivated.addListener(handleRefetch);
    return () => {
      browser.tabs.onCreated.removeListener(handleRefetch);
      browser.tabs.onUpdated.removeListener(handleRefetch);
      browser.tabs.onRemoved.removeListener(handleRefetch);
      browser.tabs.onMoved.removeListener(handleRefetch);
      browser.tabs.onActivated.removeListener(handleRefetch);
    };
  }, [queryClient]);
}
