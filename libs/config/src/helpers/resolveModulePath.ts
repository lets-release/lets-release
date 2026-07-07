import { findPackageJSON } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { readPackageSync } from "read-pkg";
import resolveFrom from "resolve-from";

export function resolveModulePath(dir: string, name: string): string;
export function resolveModulePath(
  dir: string,
  name: string,
  silent: true,
): string | undefined;
export function resolveModulePath(
  dir: string,
  name: string,
  silent?: true,
): string | undefined {
  const parentUrl = `${pathToFileURL(dir).href}/`;

  try {
    return resolveFrom(dir, name);
  } catch {
    // Ignore resolveFrom errors like: No "exports" main defined in package.json
  }

  try {
    const pkgPath = findPackageJSON(name, parentUrl);

    if (pkgPath) {
      const modulePath = path.dirname(pkgPath);

      if (readPackageSync({ cwd: modulePath }).name === name) {
        return modulePath;
      }
    }
  } catch {
    // Ignore findPackageJSON errors
  }

  try {
    return import.meta.resolve(name, parentUrl);
  } catch {
    // Ignore import.meta.resolve errors
  }

  if (silent) {
    return;
  }

  throw new Error(`Cannot find module '${name}' from '${dir}'`);
}
