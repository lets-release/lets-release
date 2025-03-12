import { existsSync } from "node:fs";
import path from "node:path";

import { findUp } from "find-up-simple";

import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { PyPIPackageManager } from "src/types/PyPIPackageManager";

export async function getPyPIPackageManager(
  pkgRoot: string,
): Promise<PyPIPackageManager | undefined> {
  if (existsSync(path.resolve(pkgRoot, "uv.lock"))) {
    return {
      name: PyPIPackageManagerName.uv,
      version: "*",
      root: pkgRoot,
    };
  }

  if (existsSync(path.resolve(pkgRoot, "poetry.lock"))) {
    return {
      name: PyPIPackageManagerName.poetry,
      version: "*",
      root: pkgRoot,
    };
  }

  const lockFile = await findUp("uv.lock", { cwd: pkgRoot });

  if (lockFile) {
    return {
      name: PyPIPackageManagerName.uv,
      version: "*",
      root: path.dirname(lockFile),
    };
  }
}
