import { fn } from 'storybook/test';

import preview from '#.storybook/preview.js';
import { TabData, WindowData } from '#models/index.js';

import { WindowCardList } from './WindowCardList';

const meta = preview.meta({
  component: WindowCardList,
  tags: ['autodocs'],
  args: {
    onManageWindow: fn(),
    onTabClick: fn(),
  },
});

const mockTabs: TabData[] = [
  {
    id: 1,
    windowId: 100,
    title: 'Google',
    url: 'https://www.google.com',
    favIconUrl: 'https://www.google.com/favicon.ico',
    active: true,
  },
  {
    id: 2,
    windowId: 100,
    title: 'YouTube',
    url: 'https://www.youtube.com',
    favIconUrl: 'https://www.youtube.com/favicon.ico',
    active: false,
  },
  {
    id: 3,
    windowId: 100,
    title: 'Facebook',
    url: 'https://www.facebook.com',
    favIconUrl: 'https://www.facebook.com/favicon.ico',
    active: false,
  },
  {
    id: 4,
    windowId: 200,
    title: 'GitHub',
    url: 'https://www.github.com',
    favIconUrl: 'https://www.github.com/favicon.ico',
    active: false,
  },
  {
    id: 5,
    windowId: 200,
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    favIconUrl: 'https://stackoverflow.com/favicon.ico',
    active: false,
  },
];

const mockWindows: WindowData[] = [{ id: 100 }, { id: 200 }];

export const Default = meta.story({
  args: {
    windows: mockWindows,
    tabs: mockTabs,
    currentWindowId: 100,
  },
});

export const EmptyState = meta.story({
  args: {
    windows: [],
    tabs: [],
    emptyMessage: 'No windows to display',
  },
});

export const SingleWindow = meta.story({
  args: {
    windows: [{ id: 100 }],
    tabs: mockTabs.filter((tab) => tab.windowId === 100),
    currentWindowId: 100,
  },
});

export const ManyWindows = meta.story({
  args: {
    windows: [{ id: 100 }, { id: 200 }, { id: 300 }, { id: 400 }],
    tabs: [
      ...mockTabs,
      {
        id: 8,
        windowId: 300,
        title: 'Reddit',
        url: 'https://www.reddit.com',
        favIconUrl: 'https://www.reddit.com/favicon.ico',
        active: false,
      },
      {
        id: 9,
        windowId: 400,
        title: 'Twitter',
        url: 'https://www.twitter.com',
        favIconUrl: 'https://www.twitter.com/favicon.ico',
        active: false,
      },
    ],
    currentWindowId: 100,
  },
});
