import { readPackage } from "read-pkg";

import { NoNpmPackageError } from "src/errors/NoNpmPackageError";
import { NoNpmPackageNameError } from "src/errors/NoNpmPackageNameError";

export async function getPackage(pkgRoot: string) {
  try {
    const pkg = await readPackage({
      cwd: pkgRoot,
    });

    if (!pkg.name) {
      throw new NoNpmPackageNameError();
    }

    return pkg;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new NoNpmPackageError();
    }

    throw error;
  }
}
