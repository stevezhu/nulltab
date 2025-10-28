import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

import renderer from './vite.config.js';

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        // We need to exclude workspace dependencies because they are not built yet so they need
        // to be included in the build process
        // exclude: [],
      }),
    ],
  },
  preload: {
    // XXX: can't use this with sandboxing because external modules need to be bundled
    // plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        output: {
          format: 'cjs', // needed if `"type": "module"` is set in package.json
        },
      },
    },
  },
  renderer,
});
