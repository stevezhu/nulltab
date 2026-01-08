import { createLink } from '@tanstack/react-router';
import { BreadcrumbLink } from '@workspace/shadcn/components/breadcrumb';
import { ComponentProps } from 'react';

export const RouterBreadcrumbLink = createLink(function RouterBreadcrumbLink(
  props: ComponentProps<typeof BreadcrumbLink>,
) {
  return <BreadcrumbLink {...props} />;
});
