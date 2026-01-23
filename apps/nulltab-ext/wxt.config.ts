/// <reference types="@wxt-dev/module-react" />

import { defineConfig } from 'wxt';

import viteConfig from './vite.config.js';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: ({ mode }) => ({
    name: mode === 'development' ? 'NullTab (Dev)' : 'NullTab',
    description:
      'A new browsing experience that replaces tab chaos with intelligent organization.',
    permissions: [
      'favicon',
      'sessions',
      'sidePanel',
      'storage',
      'tabGroups',
      'tabs',
    ],
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Ctrl+Shift+Y',
          mac: 'Command+Shift+Y',
        },
        description: 'Open NullTab popup',
      },
      open_dashboard: {
        suggested_key: {
          default: 'Alt+T',
          mac: 'Option+T',
        },
        description: 'Open NullTab dashboard',
      },
    },
  }),
  imports: false,
  modules: ['@wxt-dev/auto-icons'],
  autoIcons: {
    baseIconPath: 'assets/icon.svg',
  },
  vite: () => viteConfig,
});
