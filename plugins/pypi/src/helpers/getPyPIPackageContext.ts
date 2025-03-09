import { FindPackagesContext, PackageInfo } from "@lets-release/config";

import { getPackage } from "src/helpers/getPackage";
import { getPyPIPackageManager } from "src/helpers/getPyPIPackageManager";
import { getRegistry } from "src/helpers/getRegistry";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

export async function getPyPIPackageContext(
  context: Pick<FindPackagesContext, "env" | "repositoryRoot"> & {
    package: Pick<PackageInfo, "path">;
  },
): Promise<PyPIPackageContext | undefined> {
  const {
    package: { path: pkgRoot },
  } = context;

  const pm = await getPyPIPackageManager(pkgRoot);

  if (!pm) {
    return undefined;
  }

  const pkg = await getPackage(pkgRoot);
  const pkgContext = {
    pm,
    pkg,
  };
  const registry = await getRegistry(context, pkgContext);

  return {
    ...pkgContext,
    registry,
  };
}
