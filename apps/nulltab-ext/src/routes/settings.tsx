import { createFileRoute, Outlet } from '@tanstack/react-router';

import { createBreadcrumbsData } from '#hooks/useBreadcrumbs.js';

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
  loader: () => {
    return createBreadcrumbsData({ name: 'Settings' });
  },
});

function RouteComponent() {
  return <Outlet />;
}
