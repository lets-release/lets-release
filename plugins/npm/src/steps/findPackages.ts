import path from "node:path";
import { inspect } from "node:util";

import { globbySync } from "globby";
import { uniq } from "lodash-es";

import { PackageInfo, Step, StepFunction } from "@lets-release/config";

import { getNpmPackageContext } from "src/helpers/getNpmPackageContext";
import { NpmOptions } from "src/schemas/NpmOptions";

export const findPackages: StepFunction<Step.findPackages, NpmOptions> = async (
  context,
  options,
) => {
  await NpmOptions.parseAsync(options);

  const {
    logger,
    repositoryRoot,
    packageOptions: { paths },
    setPluginPackageContext,
  } = context;

  const pkgs: PackageInfo[] = [];
  const folders = uniq(
    paths.flatMap((p) =>
      globbySync(p, {
        cwd: repositoryRoot,
        expandDirectories: false, // FIXME: Temporary workaround for https://github.com/mrmlnc/fast-glob/issues/47
        gitignore: false,
        dot: true,
        onlyFiles: false,
      }),
    ),
  );

  for (const folder of folders.toSorted()) {
    const pkgRoot = path.resolve(repositoryRoot, folder);

    try {
      const pkgContext = await getNpmPackageContext({
        ...context,
        package: { path: pkgRoot },
      });

      if (!pkgContext) {
        logger.warn(
          `Skipping package at ${pkgRoot}: Unsupported npm package manager`,
        );

        continue;
      }

      logger.info(
        `Found package ${pkgContext.pkg.name} at ./${path.relative(repositoryRoot, pkgRoot)}`,
      );

      pkgs.push({
        name: pkgContext.pkg.name,
        path: pkgRoot,
      });

      setPluginPackageContext(pkgContext.pkg.name, pkgContext);
    } catch (error) {
      logger.warn(
        `Skipping package at ${pkgRoot}: ${inspect(error, { breakLength: Infinity, depth: 2, maxArrayLength: 5 })}`,
      );
    }
  }

  return pkgs;
};
