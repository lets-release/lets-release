import { pathToFileURL } from "node:url";

import { resolveModulePath } from "src/helpers/resolveModulePath";

/**
 * Load module (will only return default export if it exists).
 * @param name module name
 * @param dir form where to load
 * @param cwd current working directory
 * @returns module
 */
export async function loadModule<T>(
  name: string,
  dirs?: string[],
  cwd: string = process.cwd(),
): Promise<T> {
  const file =
    dirs?.reduce(
      (file: string | undefined, dir: string) =>
        file ?? resolveModulePath(dir, name, true),
      undefined,
    ) ?? resolveModulePath(cwd, name);

  const { default: cjsExport, ...esmNamedExports } = (await import(
    pathToFileURL(file).toString()
  )) as T & { default?: T };

  if (cjsExport) {
    return cjsExport;
  }

  return esmNamedExports as T;
}
