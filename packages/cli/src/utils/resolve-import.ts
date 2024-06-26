import type { ConfigLoaderSuccessResult } from 'tsconfig-paths';

import { createMatchPath } from 'tsconfig-paths';

/**
 * This module exports a function that helps to resolve import paths based on
 * the configurations provided in tsconfig.json. This could be useful in cases
 * where the project is using TypeScript path aliases.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function resolveImport(
  importPath: string,
  config: Pick<ConfigLoaderSuccessResult, 'absoluteBaseUrl' | 'paths'>
) {
  return createMatchPath(config.absoluteBaseUrl, config.paths)(
    importPath,
    undefined,
    () => true,
    ['.ts', '.tsx']
  );
}
