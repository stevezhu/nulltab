import { useSuspenseQuery } from '@tanstack/react-query';

export function useWindowsQuery() {
  const windowsQuery = useSuspenseQuery({
    queryKey: ['windows'],
    queryFn: () => browser.windows.getAll({}),
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
