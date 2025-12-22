/// <reference types="@wxt-dev/module-react" />

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'NullTab',
    description:
      'A new browsing experience that replaces tab chaos with intelligent organization.',
    permissions: ['sidePanel', 'tabs', 'tabGroups', 'storage', 'sessions'],
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
  },
  modules: ['@wxt-dev/module-react'],
  imports: false,
  react: {
    vite: {
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
