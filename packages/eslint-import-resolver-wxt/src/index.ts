import { existsSync } from 'node:fs';
import { resolve as nodeResolve } from 'node:path';

export const interfaceVersion = 2;

export function resolve(
  source: string,
  _file: string,
  config: {
    /**
     * The public path of the extension.
     *
     * eg. `resolve(import.meta.dirname, 'public')`
     */
    publicPath?: string;
  },
) {
  if (!config.publicPath) {
    throw new Error('publicPath option is required');
  }
  if (source.startsWith('/') && source.length > 1) {
    const fullPath = nodeResolve(config.publicPath, source.substring(1));
    if (existsSync(fullPath)) {
      return {
        found: true,
        path: fullPath,
      };
    }
  }
  return {
    found: false,
  };
}
