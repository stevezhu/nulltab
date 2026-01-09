import { TanStackDevtools } from '@tanstack/react-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  LinkProps,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/shadcn/components/breadcrumb';
import { Separator } from '@workspace/shadcn/components/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@workspace/shadcn/components/sidebar';
import { Fragment } from 'react';

import { RouterBreadcrumbLink } from '#components/RouterBreadcrumbLink.js';
import { RouterSidebarMenuButton } from '#components/RouterSidebarMenuButton.js';
import { useBreadcrumbs } from '#hooks/useBreadcrumbs.js';

export const Route = createRootRouteWithContext()({
  component: RootLayout,
});

function RootLayout() {
  const data = {
    navMain: [
      {
        title: 'Platform',
        items: [
          {
            title: 'Home',
            url: '/' satisfies LinkProps['to'],
          },
          {
            title: 'Settings',
            url: '/settings' satisfies LinkProps['to'],
          },
        ],
      },
    ],
  };

  const matches = useBreadcrumbs();
  const previousBreadcrumbs = matches.slice(0, -1);
  const currentBreadcrumb = matches[matches.length - 1];

  return (
    <>
      <SidebarProvider className="h-screen">
        <Sidebar>
          <SidebarContent>
            {data.navMain.map((item) => (
              <SidebarGroup key={item.title}>
                <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <RouterSidebarMenuButton
                          render={<a />}
                          to={subItem.url}
                          activeProps={{
                            isActive: true,
                          }}
                          activeOptions={{ exact: true }}
                          preload="intent"
                          preloadDelay={100}
                        >
                          {subItem.title}
                        </RouterSidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <div className="order-2 flex-1 overflow-y-auto">
            <Outlet />
          </div>
          <header
            className={`
              order-1 flex shrink-0 items-center gap-2 border-b bg-background
              p-4
            `}
          >
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className={`
                mr-2
                data-[orientation=vertical]:h-4
                data-[orientation=vertical]:self-center
              `}
            />
            <Breadcrumb>
              <BreadcrumbList>
                {previousBreadcrumbs.map((breadcrumb) => (
                  <Fragment key={breadcrumb.id}>
                    <BreadcrumbItem>
                      <RouterBreadcrumbLink to={breadcrumb.pathname}>
                        {breadcrumb.loaderData?.crumb.name}
                      </RouterBreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </Fragment>
                ))}
                {currentBreadcrumb && (
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {currentBreadcrumb.loaderData?.crumb.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
        </SidebarInset>
      </SidebarProvider>
      <TanStackDevtools
        plugins={[
          {
            name: 'TanStack Query',
            render: <ReactQueryDevtoolsPanel />,
            defaultOpen: true,
          },
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
