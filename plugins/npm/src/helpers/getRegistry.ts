import { $, ResultPromise } from "execa";

import { FindPackagesContext, PackageInfo } from "@lets-release/config";

import { DEFAULT_NPM_REGISTRY } from "src/constants/DEFAULT_NPM_REGISTRY";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const getConfig = async (
  promise: ResultPromise<{ preferLocal: true; reject: false }>,
): Promise<string> => {
  const { stdout } = await promise;

  const value = stdout.trim();

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
    pkg: { publishConfig: { registry } = { registry: undefined } },
    scope,
  }: Pick<NpmPackageContext, "pm" | "pkg" | "scope">,
): Promise<string> {
  if (registry) {
    return registry;
  }

  const options = {
    cwd: pm.root,
    env: {
      ...env,
      npm_config_color: "0",
      NPM_CONFIG_COLOR: "0",
      npm_config_no_color: "1",
      NPM_CONFIG_NO_COLOR: "1",
      force_color: "0",
      FORCE_COLOR: "0",
    },
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
    case "pnpm": {
      return (
        (scope
          ? (await getConfig(
              $({
                ...options,
                cwd: pkgRoot,
              })`pnpm config get ${`${scope}:registry`}`,
            )) ||
            (await getConfig(
              $(options)`pnpm config get ${`${scope}:registry`}`,
            ))
          : undefined) ||
        (await getConfig(
          $({
            ...options,
            cwd: pkgRoot,
          })`pnpm config get registry`,
        )) ||
        (await getConfig($(options)`pnpm config get registry`)) ||
        DEFAULT_NPM_REGISTRY
      );
    }

    case "yarn": {
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
