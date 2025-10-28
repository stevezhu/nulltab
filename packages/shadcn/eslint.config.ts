import reactConfig from '@stzhu/eslint-config/react';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  reactConfig.configs.recommended,
);
