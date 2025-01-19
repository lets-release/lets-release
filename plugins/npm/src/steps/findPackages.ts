import path from "node:path";
import { inspect } from "node:util";

import { glob } from "glob";

import { PackageInfo, Step, StepFunction } from "@lets-release/config";

import { getPackage } from "src/helpers/getPackage";
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
  } = context;

  const pkgs: PackageInfo[] = [];
  const folders = await glob(paths, { cwd: repositoryRoot });

  for (const folder of folders.toSorted()) {
    const pkgRoot = path.resolve(repositoryRoot, folder);

    try {
      const { name } = await getPackage(pkgRoot);

      logger.info(
        `Found package ${name} at ./${path.relative(repositoryRoot, pkgRoot)}`,
      );

      pkgs.push({
        path: pkgRoot,
        name,
      });
    } catch (error) {
      logger.warn(
        `Skipping package at ${pkgRoot}: ${inspect(error, { breakLength: Infinity, depth: 2, maxArrayLength: 5 })}`,
      );
    }
  }

  return pkgs;
};
