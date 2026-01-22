import { defineConfig, mergeConfig } from 'vite';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

import baseConfig from '../vite.config.js';

export default defineConfig(
  mergeConfig(baseConfig, {
    plugins: [WxtVitest()],
  }),
);
