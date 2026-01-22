import { useElementScrollRestoration } from '@tanstack/react-router';
import { createContext } from 'react';

/**
 * Context for scroll restoration using tanstack router's scroll restoration.
 *
 * This is required because in some cases, tanstack router is not used. We will pass this context
 * only in environments where tanstack router is available.
 */
export const ScrollRestorationContext = createContext<{
  scrollRestorationId?: string;
  scrollRestorationEntry?: ReturnType<typeof useElementScrollRestoration>;
}>({
  scrollRestorationId: undefined,
  scrollRestorationEntry: undefined,
});
