import path from "node:path";
import { inspect } from "node:util";

import { uniq } from "lodash-es";
import { globSync } from "tinyglobby";

import { PackageInfo, Step, StepFunction } from "@lets-release/config";

import { PYPI_PACKAGE_TYPE } from "src/constants/PYPI_PACKAGE_TYPE";
import { getPyPIPackageContext } from "src/helpers/getPyPIPackageContext";
import { PyPIOptions } from "src/schemas/PyPIOptions";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

const getDependencies = (deps: string[]) =>
  deps.flatMap((dep) => {
    const name = dep.match(/^([A-Z0-9]|[A-Z0-9][A-Z0-9._-]*[A-Z0-9])/i)?.[1];

    return name ? [name] : [];
  });

export const findPackages: StepFunction<
  Step.findPackages,
  PyPIOptions
> = async (context, options) => {
  await PyPIOptions.parseAsync(options);

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
      const pkgContext = await getPyPIPackageContext({
        ...context,
        package: { path: pkgRoot },
      });

      if (!pkgContext) {
        logger.warn(
          `Skipping package at ${pkgRoot}: Unsupported PyPI package manager`,
        );

        continue;
      }

      logger.info(
        `Found package ${pkgContext.pkg.project.name} at ./${path.relative(repositoryRoot, pkgRoot)}`,
      );

      pkgs.push({
        path: pkgRoot,
        type: PYPI_PACKAGE_TYPE,
        name: pkgContext.pkg.project.name,
      });

      setPluginPackageContext(
        PYPI_PACKAGE_TYPE,
        pkgContext.pkg.project.name,
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
        pkg: {
          project: { dependencies = [], optionalDependencies = {} },
          dependencyGroups = {},
          tool: {
            uv: { devDependencies: uvLegacyDevDependencies = [] } = {},
            poetry: {
              dependencies: poetryLegacyDependencies = {},
              group: poetryDependencyGroups = {},
            } = {},
          } = {},
        },
      } = getPluginPackageContext<PyPIPackageContext>(type, name)!;

      return [
        ...getDependencies(dependencies),
        ...Object.values(optionalDependencies).flatMap((deps) =>
          getDependencies(deps),
        ),
        ...Object.values(dependencyGroups).flatMap((deps) =>
          getDependencies(deps),
        ),
        ...getDependencies(uvLegacyDevDependencies),
        ...Object.keys(poetryLegacyDependencies),
        ...Object.values(poetryDependencyGroups).flatMap(
          ({ dependencies = {} }) => Object.keys(dependencies),
        ),
      ].includes(pkg.name.replaceAll(/[._]/g, "-"));
    }),
  }));
};
