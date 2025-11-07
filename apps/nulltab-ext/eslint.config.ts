import { resolve } from 'node:path';

import react from '@stzhu/eslint-config/react';
import tailwind from '@stzhu/eslint-config/tailwind';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  globalIgnores(['.output/', '.wxt/']),
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  react.configs.recommended,
  tailwind.configs.recommended,
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/main.css',
      },
    },
  },
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
