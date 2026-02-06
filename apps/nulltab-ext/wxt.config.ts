/// <reference types="@wxt-dev/module-react" />

import { defineConfig } from 'wxt';

import { name as packageName } from './package.json';
import viteConfig from './vite.config.js';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: ({ mode, browser }) => ({
    name: mode === 'development' ? 'NullTab (Dev)' : 'NullTab',
    description:
      'A new browsing experience that replaces tab chaos with intelligent organization.',
    permissions: [
      'sessions',
      'storage',
      'tabGroups',
      'tabs',
      ...(browser === 'chrome' || browser === 'edge' ? ['favicon'] : []),
    ],
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Ctrl+Shift+Y',
        },
        description: 'Open NullTab popup',
      },
      open_dashboard: {
        suggested_key: {
          default: 'Alt+T',
        },
        description: 'Open NullTab dashboard',
      },
    },
    browser_specific_settings: {
      gecko: {
        id: '@nulltab.nulltab',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  }),
  imports: false,
  modules: ['@wxt-dev/auto-icons', './modules/turbo.ts'],
  autoIcons: {
    baseIconPath: 'assets/icon.svg',
  },
  zip: {
    sourcesRoot: '.output/monorepo-sources/',
    excludeSources: ['.storybook/', '*.stories.*'],
  },
  turbo: {
    packageName,
  },
  vite: () => viteConfig,
});
