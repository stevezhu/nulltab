import { isMatch, useMatches } from '@tanstack/react-router';

const breadcrumbsSelect: NonNullable<
  Parameters<typeof useMatches>[0]
>['select'] = (matches) =>
  matches.filter((match) => isMatch(match, 'loaderData.crumb'));

export function useBreadcrumbs() {
  const matches = useMatches({ select: breadcrumbsSelect });
  return matches;
}

export function createBreadcrumbsData({ name }: { name: string }) {
  return {
    crumb: {
      name,
    },
  };
}
