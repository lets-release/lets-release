import path from "node:path";

import { $, ResultPromise } from "execa";
import fsExtra from "fs-extra";

import { PrepareContext } from "@lets-release/config";

import { NpmOptions } from "src/schemas/NpmOptions";
import { NpmPackageContext } from "src/types/NpmPackageContext";

// eslint-disable-next-line import-x/no-named-as-default-member
const { mkdir, move } = fsExtra;

export async function preparePackage(
  {
    env,
    stdout,
    stderr,
    logger,
    repositoryRoot,
    package: { name, path: pkgRoot },
    nextRelease: { version },
    setPluginPackageContext,
  }: PrepareContext,
  { pm, cwd, registry }: NpmPackageContext,
  { tarballDir }: NpmOptions,
) {
  logger.log({
    prefix: `[${name}]`,
    message: `Write version ${version} to package.json in ./${path.relative(repositoryRoot, pkgRoot)}`,
  });

  const options = {
    env,
    preferLocal: true as const,
  };

  let versionPromise: ResultPromise<typeof options>;

  switch (pm?.name) {
    case "pnpm": {
      versionPromise = $({
        ...options,
        cwd: pkgRoot,
      })`pnpm version ${version} --no-git-tag-version --allow-same-version`;
      break;
    }

    case "yarn": {
      versionPromise = $({
        ...options,
        cwd: pkgRoot,
      })`yarn version ${version}`;
      break;
    }

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
      prefix: `[${name}]`,
      message: `Creating npm package version ${version}`,
    });

    let promise: ResultPromise<typeof options>;

    switch (pm?.name) {
      case "pnpm": {
        // FIXME: https://github.com/pnpm/pnpm/issues/4351
        promise = $({
          ...options,
          cwd: pkgRoot,
        })`pnpm pack ${pkgRoot} --pack-destination ${pkgRoot}`;
        break;
      }

      case "yarn": {
        promise = $({
          ...options,
          cwd,
        })`yarn workspace ${name} pack --out ${path.resolve(pkgRoot, "%s-%v.tgz")} --json`;
        break;
      }

      default: {
        promise = $({
          ...options,
          cwd,
        })`npm pack ${pkgRoot} --pack-destination ${pkgRoot} --json`;
        break;
      }
    }

    promise.stdout?.pipe(stdout, { end: false });
    promise.stderr?.pipe(stderr, { end: false });

    const result = await promise;

    let tgz: string;

    switch (pm?.name) {
      case "pnpm": {
        tgz = result.stdout
          .trim()
          .split("\n")
          .find((line) => line.includes(".tgz"))!
          .trim();
        break;
      }

      case "yarn": {
        tgz = result.stdout
          .split("\n")
          .filter((line) => !!line)
          .map((line) => JSON.parse(line))
          .find(({ output }) => !!output)!
          .output.split("/")
          .at(-1)!;
        break;
      }

      default: {
        tgz = JSON.parse(result.stdout.trim())[0].filename;
        break;
      }
    }

    const tarballPath = path.resolve(pkgRoot, tarballDir.trim());

    // Only move the tarball if we need to
    // Fixes: https://github.com/semantic-release/npm/issues/169
    if (pkgRoot !== tarballPath) {
      const filename = path.basename(tgz);

      await mkdir(tarballPath, { recursive: true });
      await move(
        path.resolve(pkgRoot, filename),
        path.resolve(tarballPath, filename),
        {
          overwrite: true,
        },
      );
    }
  }

  setPluginPackageContext<NpmPackageContext>({
    pm,
    cwd,
    registry,
    prepared: true,
  });
}
