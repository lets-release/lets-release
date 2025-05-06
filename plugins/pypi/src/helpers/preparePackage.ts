import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $, ResultPromise } from "execa";
import { escapeRegExp } from "lodash-es";
import { stringify } from "smol-toml";

import { PrepareContext } from "@lets-release/config";

import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { readTomlFile } from "src/helpers/toml/readTomlFile";
import { ResolvedPyPIOptions } from "src/schemas/PyPIOptions";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

export async function preparePackage(
  {
    env,
    stdout,
    stderr,
    logger,
    repositoryRoot,
    package: { name, path: pkgRoot, uniqueName },
    nextRelease: { version },
    setPluginPackageContext,
  }: PrepareContext,
  { pm, ...rest }: PyPIPackageContext,
  { distDir }: ResolvedPyPIOptions,
) {
  logger.log({
    prefix: `[${uniqueName}]`,
    message: `Write version ${version} to pyproject.toml in ./${path.relative(repositoryRoot, pkgRoot)}`,
  });

  const options = {
    env,
    lines: true as const,
    preferLocal: true as const,
  };

  let versionPromise: ResultPromise<typeof options>;

  switch (pm.name) {
    case PyPIPackageManagerName.poetry: {
      versionPromise = $({
        ...options,
        cwd: pkgRoot,
      })`poetry version ${version}`;

      versionPromise.stdout?.pipe(stdout, { end: false });
      versionPromise.stderr?.pipe(stderr, { end: false });

      await versionPromise;

      break;
    }

    // uv
    default: {
      try {
        versionPromise = $({
          ...options,
          cwd: pm.root,
        })`uv version --project ${pkgRoot} ${version}`;

        versionPromise.stdout?.pipe(stdout, { end: false });
        versionPromise.stderr?.pipe(stderr, { end: false });

        const { stdout: versionStdout } = await versionPromise;

        // https://github.com/astral-sh/uv/issues/13213
        if (
          !versionStdout.some((line) =>
            new RegExp(
              String.raw`^${name} \S+ => ${escapeRegExp(version)}$`,
            ).test(line),
          )
        ) {
          throw new Error("error: uv issue #13213");
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes(
            `error: unexpected argument '${version}' found`,
          ) ||
            error.message.includes("error: uv issue #13213"))
        ) {
          const file = path.resolve(pkgRoot, "pyproject.toml");
          const toml = await readTomlFile(file);

          await writeFile(
            file,
            stringify({
              ...toml,
              project: {
                ...(toml.project as object),
                version,
              },
            }),
          );
        } else {
          throw error;
        }
      }

      break;
    }
  }

  logger.log({
    prefix: `[${uniqueName}]`,
    message: `Building PyPI package version ${version}`,
  });

  let promise: ResultPromise<typeof options>;

  switch (pm.name) {
    case PyPIPackageManagerName.poetry: {
      promise = $({
        ...options,
        cwd: pkgRoot,
      })`poetry build --output ${path.resolve(pkgRoot, distDir)}`;
      break;
    }

    // uv
    default: {
      promise = $({
        ...options,
        cwd: pm.root,
      })`uv build --project ${pkgRoot} --out-dir ${path.resolve(pkgRoot, distDir)}`;
      break;
    }
  }

  promise.stdout?.pipe(stdout, { end: false });
  promise.stderr?.pipe(stderr, { end: false });

  await promise;

  setPluginPackageContext<PyPIPackageContext>({
    ...rest,
    pm,
    prepared: true,
  });
}
