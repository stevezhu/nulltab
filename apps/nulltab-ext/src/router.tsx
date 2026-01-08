import { QueryClient } from '@tanstack/react-query';
import {
  createHashHistory,
  createRouter,
  useRouter,
} from '@tanstack/react-router';

import { ErrorFallback } from '#components/Fallback/ErrorFallback.js';
import { NotFoundFallback } from '#components/Fallback/NotFoundFallback.js';
import { PendingFallback } from '#components/Fallback/PendingFallback.js';
import { routeTree } from '#routeTree.gen.js';

export const queryClient = new QueryClient();

const hashHistory = createHashHistory();
export const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  context: {
    queryClient,
  },
  defaultPendingComponent: PendingFallback,
  defaultErrorComponent: ErrorFallback,
  defaultNotFoundComponent: function DefaultNotFoundFallback() {
    const router = useRouter();
    return (
      <NotFoundFallback
        onGoHome={() => router.navigate({ to: '/' })}
        onGoBack={() => {
          router.history.back();
        }}
      />
    );
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
