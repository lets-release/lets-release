import { mkdir, rename } from "node:fs/promises";
import path from "node:path";

import { $, ResultPromise } from "execa";
import stripAnsi from "strip-ansi";

import { PrepareContext } from "@lets-release/config";

import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";
import { NpmOptions } from "src/schemas/NpmOptions";
import { NpmPackageContext } from "src/types/NpmPackageContext";

export async function preparePackage(
  {
    env,
    stdout,
    stderr,
    logger,
    repositoryRoot,
    package: { path: pkgRoot, name, uniqueName },
    nextRelease: { version },
    setPluginPackageContext,
  }: PrepareContext,
  { pm, registry, ...rest }: NpmPackageContext,
  { tarballDir }: NpmOptions,
) {
  logger.log({
    prefix: `[${uniqueName}]`,
    message: `Write version ${version} to package.json in ./${path.relative(repositoryRoot, pkgRoot)}`,
  });

  const options = {
    env,
    lines: true as const,
    preferLocal: true as const,
  };

  let versionPromise: ResultPromise<typeof options>;

  switch (pm.name) {
    case NpmPackageManagerName.pnpm: {
      versionPromise = $({
        ...options,
        cwd: pkgRoot,
      })`pnpm version ${version} --no-git-tag-version --allow-same-version`;
      break;
    }

    case NpmPackageManagerName.yarn: {
      versionPromise = $({
        ...options,
        cwd: pkgRoot,
      })`yarn version ${version}`;
      break;
    }

    // npm
    default: {
      versionPromise = $({
        ...options,
        cwd: pkgRoot,
      })`npm version ${version} --no-git-tag-version --allow-same-version`;
      break;
    }
  }

  versionPromise.stdout?.pipe(stdout, { end: false });
  versionPromise.stderr?.pipe(stderr, { end: false });

  await versionPromise;

  if (tarballDir) {
    logger.log({
      prefix: `[${uniqueName}]`,
      message: `Creating npm package version ${version}`,
    });

    let promise: ResultPromise<typeof options>;

    switch (pm.name) {
      case NpmPackageManagerName.pnpm: {
        promise = $({
          ...options,
          cwd: pkgRoot, // FIXME: https://github.com/pnpm/pnpm/issues/4351
        })`pnpm pack ${pkgRoot} --pack-destination ${pkgRoot}`;
        break;
      }

      case NpmPackageManagerName.yarn: {
        promise = $({
          ...options,
          cwd: pm.root,
        })`yarn workspace ${name} pack --out ${path.resolve(pkgRoot, "%s-%v.tgz")} --json`;
        break;
      }

      // npm
      default: {
        // npm 8 returns wrong filename with "/" in json output
        promise = $({
          ...options,
          cwd: pm.root,
        })`npm pack ${pkgRoot} --pack-destination ${pkgRoot}`;
        break;
      }
    }

    promise.stdout?.pipe(stdout, { end: false });
    promise.stderr?.pipe(stderr, { end: false });

    const result = await promise;

    let tgz: string;

    switch (pm.name) {
      case NpmPackageManagerName.pnpm: {
        tgz = stripAnsi(
          result.stdout.find((line) => line.includes(".tgz"))!,
        ).trim();
        break;
      }

      case NpmPackageManagerName.yarn: {
        tgz = result.stdout
          .flatMap((line) => {
            const trimmed = stripAnsi(line).trim();

            if (!trimmed) {
              return [];
            }

            try {
              return [JSON.parse(trimmed)];
            } catch {
              return [];
            }
          })
          .find(({ output }) => !!output)!.output;
        break;
      }

      // npm
      default: {
        tgz = stripAnsi(
          result.stdout.find((line) => line.includes(".tgz"))!,
        ).trim();
        break;
      }
    }

    const tarballPath = path.resolve(pkgRoot, tarballDir.trim());

    // Only move the tarball if we need to
    // Fixes: https://github.com/semantic-release/npm/issues/169
    if (pkgRoot !== tarballPath) {
      const filename = path.basename(tgz);

      await mkdir(tarballPath, { recursive: true });
      await rename(
        path.resolve(pkgRoot, filename),
        path.resolve(tarballPath, filename),
      );
    }
  }

  setPluginPackageContext<NpmPackageContext>({
    ...rest,
    pm,
    registry,
    prepared: true,
  });
}
