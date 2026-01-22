import {
  createFileRoute,
  useElementScrollRestoration,
} from '@tanstack/react-router';

import { isMacQueryOptions } from '#api/queryOptions/isMac.js';
import { mainTabGroupQueryOptions } from '#api/queryOptions/mainTabGroup.js';
import {
  sortedTabsQueryOptions,
  tabsQueryOptions,
} from '#api/queryOptions/tabs.js';
import {
  tabAssignmentsQueryOptions,
  topicsQueryOptions,
} from '#api/queryOptions/topics.js';
import { currentWindowQueryOptions } from '#api/queryOptions/windows.js';
import { createBreadcrumbsData } from '#hooks/useBreadcrumbs.js';
import { ExtensionPage } from '#pages/ExtensionPage/index.js';
import { ScrollRestorationContext } from '#pages/ExtensionPage/ScrollRestorationContext.js';

export const Route = createFileRoute('/')({
  component: Index,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(isMacQueryOptions),
      context.queryClient.ensureQueryData(topicsQueryOptions),
      context.queryClient.ensureQueryData(tabsQueryOptions),
      context.queryClient.ensureQueryData(tabAssignmentsQueryOptions),
      context.queryClient.ensureQueryData(mainTabGroupQueryOptions),
      context.queryClient.ensureQueryData(currentWindowQueryOptions),
      context.queryClient.ensureQueryData(sortedTabsQueryOptions),
    ]);
    return createBreadcrumbsData({ name: 'Home' });
  },
});

function Index() {
  const scrollRestorationId = 'all-tabs-scroll-restoration';
  const scrollRestorationEntry = useElementScrollRestoration({
    id: scrollRestorationId,
  });
  return (
    <ScrollRestorationContext.Provider
      value={{ scrollRestorationId, scrollRestorationEntry }}
    >
      <ExtensionPage />
    </ScrollRestorationContext.Provider>
  );
}
