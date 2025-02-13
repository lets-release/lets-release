import { $, ResultPromise } from "execa";

import { FindPackagesContext } from "@lets-release/config";

import { DEFAULT_NPM_REGISTRY } from "src/constants/DEFAULT_NPM_REGISTRY";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const getConfig = async (
  promise: ResultPromise<{ preferLocal: true; reject: false }>,
): Promise<string> => {
  const { stdout } = await promise;

  const value = stdout.trim();

  if (value === "undefined") {
    return "";
  }

  return value;
};

export async function getRegistry(
  { env }: Pick<FindPackagesContext, "env">,
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
    case "pnpm": {
      return (
        (scope
          ? await getConfig($(options)`pnpm config get ${`${scope}:registry`}`)
          : undefined) ||
        (await getConfig($(options)`pnpm config get registry`)) ||
        DEFAULT_NPM_REGISTRY
      );
    }

    case "yarn": {
      return (
        (scope
          ? await getConfig(
              $(
                options,
              )`yarn config get ${`npmScopes["${scope.replace(/^@/, "")}"].npmRegistryServer`}`,
            )
          : undefined) ||
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
