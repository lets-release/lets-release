import path from "node:path";

import debug from "debug";
import { uniq } from "lodash-es";
import { globSync } from "tinyglobby";

import { PackageInfo, Step, StepFunction } from "@lets-release/config";

import { PYPI_PACKAGE_TYPE } from "src/constants/PYPI_PACKAGE_TYPE";
import { getPyPIPackageContext } from "src/helpers/getPyPIPackageContext";
import { name } from "src/plugin";
import { PyPIOptions } from "src/schemas/PyPIOptions";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

const getDependencies = (deps: string[]) =>
  deps.flatMap((dep) => {
    const regExp =
      /^\s*(?<name>[A-Za-z0-9._-]+)(?<extras>\[[^\]]+\])?(?<versions>\s*(?:~=|===|==|!=|<=|>=|<|>)[^\s,;]+(?:\s*,\s*(?:~=|===|==|!=|<=|>=|<|>)[^\s,;]+)*)?(?<url>\s*@\s*[^;]+)?(?<marker>\s*;\s*.*)?\s*$/;
    const match = regExp.exec(dep);

    if (match?.groups) {
      return [match.groups.name];
    }

    return [];
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
    const relativePkgRoot = `./${path.relative(repositoryRoot, pkgRoot)}`;

    try {
      const pkgContext = await getPyPIPackageContext({
        ...context,
        package: { path: pkgRoot },
      });

      if (!pkgContext) {
        logger.warn(
          `Skipping package at ${relativePkgRoot}: Unsupported PyPI package manager`,
        );

        continue;
      }

      logger.info(
        `Found package ${pkgContext.pkg.project.name} at ${relativePkgRoot}`,
      );

      pkgs.push({
        path: pkgRoot,
        type: PYPI_PACKAGE_TYPE,
        name: pkgContext.pkg.project.name,
        formerName: pkgContext.pkg.tool?.letsRelease?.formerName,
      });

      setPluginPackageContext(
        PYPI_PACKAGE_TYPE,
        pkgContext.pkg.project.name,
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
