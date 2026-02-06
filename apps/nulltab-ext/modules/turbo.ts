import { copyFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import isPathInside from 'is-path-inside';
import { x } from 'tinyexec';
import type { Wxt } from 'wxt';
import { defineWxtModule } from 'wxt/modules';

export interface TurboModuleOptions {
  /**
   * The package name of the project to generate sources for. This need to match the package name in the package.json of the project.
   */
  packageName: string;
}

declare module 'wxt' {
  export interface InlineConfig {
    turbo: TurboModuleOptions;
  }
}

export default defineWxtModule<TurboModuleOptions>({
  configKey: 'turbo',
  setup(wxt, options) {
    const packageName = options?.packageName;
    if (!packageName) {
      throw new Error('packageName is required');
    }

    wxt.hook('zip:sources:start', async (wxt) => {
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
    });

    wxt.hook('zip:sources:done', async (wxt) => {
      await checkTurborepoInstalled(wxt, false);
      await clearZipSourcesRoot(wxt);
    });
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
