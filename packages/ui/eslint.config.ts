import react from '@stzhu/eslint-config/react';
import storybook from '@stzhu/eslint-config/storybook';
import tailwind from '@stzhu/eslint-config/tailwind';
import { defineConfig } from 'eslint/config';

export default defineConfig(
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
        entryPoint: './src/main.css',
      },
    },
  },
  storybook.configs.recommended,
);
