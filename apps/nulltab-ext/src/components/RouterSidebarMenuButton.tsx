import { createLink } from '@tanstack/react-router';
import { SidebarMenuButton } from '@workspace/shadcn/components/sidebar';

/**
 * This component is a wrapper around the SidebarMenuButton component that adds
 * the ability to use the Link component from `@tanstack/react-router`.
 * @param props
 * @return
 */
export const RouterSidebarMenuButton = createLink(SidebarMenuButton);
