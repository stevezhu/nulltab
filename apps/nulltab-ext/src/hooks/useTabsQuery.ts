import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { browser } from 'wxt/browser';

export function useTabsQuery() {
  const tabsQuery = useSuspenseQuery({
    queryKey: ['tabs'],
    queryFn: () => browser.tabs.query({}),
  });

  useEffect(() => {
    const handleRefetch = () => void tabsQuery.refetch();

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
  }, [tabsQuery]);

  return tabsQuery;
}
