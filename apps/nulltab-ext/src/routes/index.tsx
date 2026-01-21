import { createFileRoute } from '@tanstack/react-router';

import { isMacQueryOptions } from '#api/queryOptions/isMac.js';
import { createBreadcrumbsData } from '#hooks/useBreadcrumbs.js';
import { ExtensionPage } from '#pages/ExtensionPage/index.js';
import { queryClient } from '#router.js';

export const Route = createFileRoute('/')({
  component: Index,
  loader: async () => {
    await queryClient.ensureQueryData(isMacQueryOptions);
    return createBreadcrumbsData({ name: 'Home' });
  },
});

function Index() {
  return <ExtensionPage />;
}
