import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'NullTab',
    description:
      'A new browsing experience that replaces tab chaos with intelligent organization.',
  },
  modules: ['@wxt-dev/module-react'],
});
