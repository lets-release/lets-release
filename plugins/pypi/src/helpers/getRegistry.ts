import normalizeUrl from "normalize-url";

import {
  FindPackagesContext,
  PackageInfo,
  PartialRequired,
} from "@lets-release/config";

import { DEFAULT_PYPI_REGISTRY } from "src/constants/DEFAULT_PYPI_REGISTRY";
import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { getPoetryRegistries } from "src/helpers/getPoetryRegistries";
import { getUvConfig } from "src/helpers/getUvConfig";
import { name } from "src/plugin";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";
import { PyPIRegistry } from "src/types/PyPIRegistry";

export async function getRegistry(
  context: Pick<FindPackagesContext, "env"> & {
    package: Pick<PackageInfo, "path">;
  },
  pkgContext: Pick<PyPIPackageContext, "pm" | "pkg">,
): Promise<PartialRequired<PyPIRegistry, "name">> {
  const { env } = context;
  const {
    pm,
    pkg: { tool: { letsRelease: { registry } = {} } = {} },
  } = pkgContext;

  switch (pm.name) {
    case PyPIPackageManagerName.poetry: {
      const envRegistries = Object.entries(env).flatMap(([key, value]) => {
        const name = /^POETRY_REPOSITORIES_([A-Z0-9_]+)_URL$/.exec(key)?.[1];

        if (!name || !value) {
          return [];
        }

        return [
          {
            name: name.toLowerCase(),
            publishUrl: normalizeUrl(value),
          },
        ];
      });
      const configRegistries = await getPoetryRegistries({ cwd: pm.root, env });

      if (registry?.publishUrl) {
        const normalizedPublishUrl = normalizeUrl(registry.publishUrl);
        const foundEnv = envRegistries.find(
          ({ publishUrl }) => publishUrl === normalizedPublishUrl,
        );

        if (foundEnv) {
          return foundEnv;
        }

        const foundConfig = configRegistries.find(
          ({ publishUrl }) => publishUrl === normalizedPublishUrl,
        );

        if (foundConfig) {
          return foundConfig;
        }
      }

      if (registry?.name) {
        const foundEnv = envRegistries.find(
          ({ name }) =>
            name === registry.name?.toLowerCase().replaceAll(/[.-]/g, "_"),
        );

        if (foundEnv) {
          return foundEnv;
        }

        const foundConfig = configRegistries.find(
          ({ name }) => name === registry.name,
        );

        if (foundConfig) {
          return foundConfig;
        }
      }

      return DEFAULT_PYPI_REGISTRY;
    }

    // uv
    default: {
      if (registry?.publishUrl) {
        return {
          name: registry?.name || name,
          url: registry?.url,
          publishUrl: registry.publishUrl,
        };
      }

      if (env.UV_PUBLISH_URL) {
        return {
          name: env.UV_PUBLISH_INDEX || name,
          url: env.UV_PUBLISH_CHECK_URL,
          publishUrl: env.UV_PUBLISH_URL,
        };
      }

      if (env.UV_PUBLISH_INDEX) {
        const uvConfig = await getUvConfig(context, pkgContext);
        const found = uvConfig?.index?.find(
          ({ name }) => name === env.UV_PUBLISH_INDEX,
        );

        if (found) {
          return {
            name: found.name!,
            url: found.url || env.UV_PUBLISH_CHECK_URL,
            publishUrl: found.publishUrl,
          };
        }
      }

      return DEFAULT_PYPI_REGISTRY;
    }
  }
}
