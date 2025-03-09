import { FindPackagesContext, PackageInfo } from "@lets-release/config";

import { DEFAULT_PYPI_USERNAME } from "src/constants/DEFAULT_PYPI_USERNAME";
import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { getPoetryConfig } from "src/helpers/getPoetryConfig";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

export async function getAuth(
  context: Pick<FindPackagesContext, "env"> & {
    package: Pick<PackageInfo, "path">;
  },
  pkgContext: Pick<PyPIPackageContext, "pm" | "pkg" | "registry">,
) {
  const { env } = context;
  const {
    pm,
    pkg: { tool: { letsRelease = {} } = {} },
    registry,
  } = pkgContext;

  switch (pm.name) {
    case PyPIPackageManagerName.poetry: {
      const name = registry.name.toUpperCase().replaceAll(/[.-]/g, "_");

      const token =
        letsRelease.token ||
        env[`POETRY_PYPI_TOKEN_${name}`] ||
        (await getPoetryConfig(`pypi-token.${registry.name}`, {
          cwd: pm.root,
          env,
        }));

      const username =
        letsRelease.username ||
        env[`POETRY_HTTP_BASIC_${name}_USERNAME`] ||
        (await getPoetryConfig(`http-basic.${registry.name}.username`, {
          cwd: pm.root,
          env,
        })) ||
        DEFAULT_PYPI_USERNAME;

      const password =
        letsRelease.password ||
        env[`POETRY_HTTP_BASIC_${name}_PASSWORD`] ||
        (await getPoetryConfig(`http-basic.${registry.name}.password`, {
          cwd: pm.root,
          env,
        }));

      return {
        token,
        username,
        password,
      };
    }

    // uv
    default: {
      const token = letsRelease.token || env.UV_PUBLISH_TOKEN;
      const username =
        letsRelease.username ||
        env.UV_PUBLISH_USERNAME ||
        DEFAULT_PYPI_USERNAME;
      const password = letsRelease.password || env.UV_PUBLISH_PASSWORD;

      return {
        token,
        username,
        password,
      };
    }
  }
}
