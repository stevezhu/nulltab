import { resolve } from 'node:path';

import reactConfig from '@stzhu/eslint-config/react';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  globalIgnores(['.output/', '.wxt/']),
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  reactConfig.configs.recommended,
  {
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
        wxt: {
          publicPath: resolve(import.meta.dirname, 'public'),
        },
      },
    },
  },
);
