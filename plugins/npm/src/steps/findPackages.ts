import path from "node:path";

import debug from "debug";
import { uniq } from "lodash-es";
import { globSync } from "tinyglobby";

import { PackageInfo, Step, StepFunction } from "@lets-release/config";

import { NPM_PACKAGE_TYPE } from "src/constants/NPM_PACKAGE_TYPE";
import { getNpmPackageContext } from "src/helpers/getNpmPackageContext";
import { name } from "src/plugin";
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
    const relativePkgRoot = `./${path.relative(repositoryRoot, pkgRoot)}`;

    try {
      const pkgContext = await getNpmPackageContext({
        ...context,
        package: { path: pkgRoot },
      });

      if (!pkgContext) {
        logger.warn(
          `Skipping package at ${relativePkgRoot}: Unsupported npm package manager`,
        );

        continue;
      }

      logger.info(`Found package ${pkgContext.pkg.name} at ${relativePkgRoot}`);

      const letsRelease = pkgContext.pkg["lets-release"] as
        | Record<string, unknown>
        | undefined;
      const formerName =
        letsRelease &&
        typeof letsRelease === "object" &&
        letsRelease.formerName &&
        typeof letsRelease.formerName === "string"
          ? letsRelease.formerName
          : undefined;

      pkgs.push({
        path: pkgRoot,
        type: NPM_PACKAGE_TYPE,
        name: pkgContext.pkg.name,
        formerName,
      });

      setPluginPackageContext(
        NPM_PACKAGE_TYPE,
        pkgContext.pkg.name,
        pkgContext,
      );
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`Skipping package at ${relativePkgRoot}: ${error.message}`);
      }

      debug(name)(error);
    }
  }

  return pkgs.map(({ type, name, ...rest }) => ({
    ...rest,
    type,
    name,
    dependencies: pkgs.filter((pkg) => {
      const {
        pkg: { dependencies, devDependencies, optionalDependencies },
      } = getPluginPackageContext<NpmPackageContext>(type, name)!;

      return Object.keys({
        ...dependencies,
        ...devDependencies,
        ...optionalDependencies,
      }).includes(pkg.name);
    }),
  }));
};
