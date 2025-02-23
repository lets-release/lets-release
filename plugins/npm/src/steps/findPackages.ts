import path from "node:path";
import { inspect } from "node:util";

import { uniq } from "lodash-es";
import { globSync } from "tinyglobby";

import { PackageInfo, Step, StepFunction } from "@lets-release/config";

import { NPM_PACKAGE_TYPE } from "src/constants/NPM_PACKAGE_TYPE";
import { getNpmPackageContext } from "src/helpers/getNpmPackageContext";
import { NpmOptions } from "src/schemas/NpmOptions";
import { NpmPackageContext } from "src/types/NpmPackageContext";

export const findPackages: StepFunction<Step.findPackages, NpmOptions> = async (
  context,
  options,
) => {
  await NpmOptions.parseAsync(options);

  const {
    logger,
    repositoryRoot,
    packageOptions: { paths },
    getPluginPackageContext,
    setPluginPackageContext,
  } = context;

  const pkgs: PackageInfo[] = [];
  const folders = uniq(
    paths.flatMap((p) =>
      globSync(p, {
        cwd: repositoryRoot,
        expandDirectories: false,
        dot: true,
        onlyDirectories: true,
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
        path: pkgRoot,
        type: NPM_PACKAGE_TYPE,
        name: pkgContext.pkg.name,
      });

      setPluginPackageContext(
        NPM_PACKAGE_TYPE,
        pkgContext.pkg.name,
        pkgContext,
      );
    } catch (error) {
      logger.warn(
        `Skipping package at ${pkgRoot}: ${inspect(error, { breakLength: Infinity, depth: 2, maxArrayLength: 5 })}`,
      );
    }
  }

  return pkgs.map(({ type, name, ...rest }) => ({
    ...rest,
    type,
    name,
    dependencies: pkgs.filter((pkg) => {
      const {
        pkg: { dependencies, devDependencies },
      } = getPluginPackageContext<NpmPackageContext>(type, name)!;

      return Object.keys({ ...dependencies, ...devDependencies }).includes(
        pkg.name,
      );
    }),
  }));
};
