/// <reference types="@wxt-dev/module-react" />

import { copyFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import isPathInside from 'is-path-inside';
import { x } from 'tinyexec';
import { defineConfig, Wxt } from 'wxt';

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
  modules: ['@wxt-dev/auto-icons'],
  autoIcons: {
    baseIconPath: 'assets/icon.svg',
  },
  zip: {
    sourcesRoot: '.output/monorepo-sources/',
    excludeSources: ['.storybook/', '*.stories.*'],
  },
  vite: () => viteConfig,
  hooks: {
    'zip:sources:start': async (wxt) => {
      await checkTurborepoInstalled(wxt, true);
      await clearZipSourcesRoot(wxt);

      const { sourcesRoot } = wxt.config.zip;
      const absoluteSourcesRoot = resolve(import.meta.dirname, sourcesRoot);
      const proc = x('turbo', [
        'prune',
        packageName,
        '--out-dir',
        absoluteSourcesRoot,
      ]);
      proc.process?.stdout?.on('data', (data: Buffer) => {
        wxt.logger.info(data.toString().trimEnd());
      });
      const res = await proc;
      if (res.exitCode !== 0) {
        throw new Error(res.stderr);
      }
      await copyFile(
        resolve(import.meta.dirname, 'FIREFOX_README.md'),
        resolve(absoluteSourcesRoot, 'FIREFOX_README.md'),
      );
    },
    'zip:sources:done': async (wxt) => {
      await checkTurborepoInstalled(wxt, false);
      await clearZipSourcesRoot(wxt);
    },
  },
});

async function checkTurborepoInstalled(wxt: Wxt, log: boolean) {
  try {
    await x('turbo', ['--version']);
    if (log)
      wxt.logger.info('Turborepo is installed. Generating monorepo sources...');
  } catch (error) {
    // https://github.com/nodejs/node/issues/46869
    if (
      error instanceof Error &&
      'code' in error &&
      typeof error.code === 'string' &&
      error.code === 'ENOENT'
    ) {
      if (log) wxt.logger.info('Turborepo is not installed');
      return;
    }
    throw error;
  }
}

async function clearZipSourcesRoot(wxt: Wxt) {
  const { sourcesRoot } = wxt.config.zip;
  // Safety check: ensure sources root is under .output
  if (!isPathInside(sourcesRoot, resolve(import.meta.dirname, '.output'))) {
    throw new Error(
      `Sources root must be under .output directory for safety. Received: ${sourcesRoot}`,
    );
  }

  const absoluteSourcesRoot = resolve(import.meta.dirname, sourcesRoot);
  await rm(absoluteSourcesRoot, { recursive: true, force: true });
}
