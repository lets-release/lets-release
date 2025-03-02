// eslint-disable-next-line import-x/default
import preferredPM from "preferred-pm";
import resolveWorkspaceRootPkg from "resolve-workspace-root";

import { FindPackagesContext, PackageInfo } from "@lets-release/config";

import { getPackage } from "src/helpers/getPackage";
import { getRegistry } from "src/helpers/getRegistry";
import { NpmPackageContext } from "src/types/NpmPackageContext";
import { NpmPackageManager } from "src/types/NpmPackageManager";

// eslint-disable-next-line import-x/no-named-as-default-member
const { resolveWorkspaceRoot } = resolveWorkspaceRootPkg;

export async function getNpmPackageContext(
  context: Pick<FindPackagesContext, "env"> & {
    package: Pick<PackageInfo, "path">;
  },
): Promise<NpmPackageContext | undefined> {
  const {
    package: { path: pkgRoot },
  } = context;

  const packageManager = await preferredPM(pkgRoot);

  if (
    !packageManager ||
    !["npm", "pnpm", "yarn"].includes(packageManager.name)
  ) {
    return undefined;
  }

  const pm = {
    ...packageManager,
    root: resolveWorkspaceRoot(pkgRoot) ?? pkgRoot,
  } as NpmPackageManager;
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
