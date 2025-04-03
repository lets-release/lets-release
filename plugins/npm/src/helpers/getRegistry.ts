/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { $, ResultPromise } from "execa";
import stripAnsi from "strip-ansi";

import { FindPackagesContext, PackageInfo } from "@lets-release/config";

import { DEFAULT_NPM_REGISTRY } from "src/constants/DEFAULT_NPM_REGISTRY";
import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const getConfig = async (
  promise: ResultPromise<{ preferLocal: true; reject: false }>,
): Promise<string> => {
  const { stdout } = await promise;

  const value = stripAnsi(stdout).trim();

  if (value === "undefined" || value === "null") {
    return "";
  }

  return value;
};

export async function getRegistry(
  {
    env,
    package: { path: pkgRoot },
  }: Pick<FindPackagesContext, "env"> & {
    package: Pick<PackageInfo, "path">;
  },
  {
    pm,
    pkg: { publishConfig: { registry } = {} },
    scope,
  }: Pick<NpmPackageContext, "pm" | "pkg" | "scope">,
): Promise<string> {
  if (registry) {
    return registry;
  }

  const options = {
    cwd: pm.root,
    env,
    preferLocal: true,
    reject: false,
  };

  // https://docs.npmjs.com/cli/v11/using-npm/config
  // npm gets its configuration values from the following sources, sorted by priority:
  // - Command Line Flags
  // - Environment Variables
  // - npmrc Files
  // - Default Configs

  switch (pm.name) {
    case NpmPackageManagerName.pnpm: {
      return (
        (scope
          ? (await getConfig(
              $({
                ...options,
                cwd: pkgRoot,
              })`pnpm config --location=project get ${`${scope}:registry`}`,
            )) ||
            (await getConfig(
              $(
                options,
              )`pnpm config --location=project get ${`${scope}:registry`}`,
            )) ||
            (await getConfig(
              $(options)`pnpm config get ${`${scope}:registry`}`,
            ))
          : undefined) ||
        (await getConfig(
          $({
            ...options,
            cwd: pkgRoot,
          })`pnpm config --location=project get registry`,
        )) ||
        (await getConfig(
          $(options)`pnpm config --location=project get registry`,
        )) ||
        (await getConfig($(options)`pnpm config get registry`)) ||
        DEFAULT_NPM_REGISTRY
      );
    }

    case NpmPackageManagerName.yarn: {
      return (
        (scope
          ? (await getConfig(
              $(
                options,
              )`yarn config get ${`npmScopes["${scope.replace(/^@/, "")}"].npmPublishRegistry`}`,
            )) ||
            (await getConfig(
              $(
                options,
              )`yarn config get ${`npmScopes["${scope.replace(/^@/, "")}"].npmRegistryServer`}`,
            ))
          : undefined) ||
        (await getConfig($(options)`yarn config get npmPublishRegistry`)) ||
        (await getConfig($(options)`yarn config get npmRegistryServer`)) ||
        DEFAULT_NPM_REGISTRY
      );
    }

    // npm
    default: {
      return (
        (scope
          ? await getConfig($(options)`npm config get ${`${scope}:registry`}`)
          : undefined) ||
        (await getConfig($(options)`npm config get registry`)) ||
        DEFAULT_NPM_REGISTRY
      );
    }
  }
}
