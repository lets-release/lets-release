import path from "node:path";

import { findUp } from "find-up-simple";
// eslint-disable-next-line import-x/default
import preferredPM from "preferred-pm";

import { FindPackagesContext, PackageInfo } from "@lets-release/config";

import { getPackage } from "src/helpers/getPackage";
import { getRegistry } from "src/helpers/getRegistry";
import { NpmPackageContext } from "src/types/NpmPackageContext";
import { NpmPackageManager } from "src/types/NpmPackageManager";

export async function getNpmPackageContext(
  context: Pick<FindPackagesContext, "env" | "repositoryRoot"> & {
    package: Pick<PackageInfo, "path">;
  },
): Promise<NpmPackageContext | undefined> {
  const {
    repositoryRoot,
    package: { path: pkgRoot },
  } = context;

  const packageManager = await preferredPM(pkgRoot);

  if (
    !packageManager ||
    !["npm", "pnpm", "yarn"].includes(packageManager.name)
  ) {
    return undefined;
  }

  const findRcFile = async () => {
    const options = { cwd: pkgRoot, stopAt: path.dirname(repositoryRoot) };

    if (packageManager.name === "yarn") {
      return (
        (await findUp(".yarnrc.yml", options)) ??
        (await findUp(".yarnrc", options))
      );
    }

    return await findUp(".npmrc", options);
  };

  const rcFile = await findRcFile();
  const root = rcFile ? path.dirname(rcFile) : pkgRoot;
  const pm = { ...packageManager, root } as NpmPackageManager;
  const pkg = await getPackage(pkgRoot);
  const [pkgScope] = pkg.name.split("/");
  const scope = pkgScope.startsWith("@") ? pkgScope : undefined;
  const pkgContext = {
    pm,
    pkg,
    scope,
  };
  const registry = await getRegistry(context, pkgContext);

  return {
    ...pkgContext,
    registry,
  };
}
