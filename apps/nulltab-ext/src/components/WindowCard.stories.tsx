import { Button } from '@workspace/shadcn/components/button';
import { ReactNode } from 'react';
import { fn } from 'storybook/test';

import preview from '#.storybook/preview.js';

import {
  WindowCard,
  WindowCardHeader,
  WindowCardTab,
  WindowCardTabProps,
  WindowCardTabs,
} from './WindowCard';

const meta = preview.meta({
  component: function WindowCardStory({
    title,
    tabCount,
    tabs,
    actions,
    active,
    disabled,
    onTabClick,
  }: {
    title?: string;
    tabCount?: number;
    tabs: Array<
      Pick<WindowCardTabProps, 'title' | 'url' | 'favIconUrl' | 'active'> & {
        id: number;
      }
    >;
    actions?: ReactNode;
    active?: boolean;
    disabled?: boolean;
    onTabClick?: (tabId: number) => void;
  }) {
    return (
      <WindowCard active={active} disabled={disabled}>
        {title && actions && (
          <WindowCardHeader title={title} tabCount={tabCount}>
            {actions}
          </WindowCardHeader>
        )}
        <WindowCardTabs>
          {tabs.map((tab) => {
            return (
              <WindowCardTab
                key={tab.id}
                active={active}
                disabled={disabled}
                onClick={() => onTabClick?.(tab.id)}
                {...tab}
              />
            );
          })}
        </WindowCardTabs>
      </WindowCard>
    );
  },
  subcomponents: {
    WindowCard,
    WindowCardHeader,
    WindowCardTabs,
    WindowCardTab,
  },
  tags: ['autodocs'],
  args: {
    onTabClick: fn(),
  },
  argTypes: {
    actions: { control: false },
    onTabClick: { control: false },
  },
});

export const Default = meta.story({
  args: {
    title: 'Window 1',
    tabCount: 3,
    tabs: [
      {
        id: 1,
        title: 'Tab 1',
        url: 'https://www.google.com',
        favIconUrl: 'https://www.google.com/favicon.ico',
        active: true,
      },
      {
        id: 2,
        title: 'Tab 2',
        url: 'https://www.youtube.com',
        favIconUrl: 'https://www.youtube.com/favicon.ico',
        active: false,
      },
      {
        id: 3,
        title: 'Tab 3',
        url: 'https://www.facebook.com',
        favIconUrl: 'https://www.facebook.com/favicon.ico',
        active: false,
      },
    ],
    actions: <Button>Open</Button>,
    isHighlighted: false,
    isClosed: false,
  },
});

export const Disabled = Default.extend({
  args: {
    disabled: true,
  },
});

export const Active = Default.extend({
  args: {
    active: true,
  },
});

export const NoTabCount = Default.extend({
  args: {
    tabCount: undefined,
  },
});

export const NoHeader = Default.extend({
  args: {
    title: undefined,
    actions: undefined,
  },
});

export const LongText = Default.extend({
  args: {
    tabs: [
      {
        id: 1,
        title:
          'A Very Long Title That Might Wrap to Multiple Lines in Certain Scenarios',
        url: 'https://www.googleasdklajsdkajsdkajskldjalksdjkalsjldkajsdljaskdjkalsjdklasjkdljaskldjkalsdjaklsjdlkasd.com/search?q=a+very+long+title+that+might+wrap+to+multiple+lines+in+certain+scenarios',
        favIconUrl: 'https://www.google.com/favicon.ico',
        active: true,
      },
    ],
  },
});
