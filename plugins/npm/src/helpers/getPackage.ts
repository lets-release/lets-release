import { readPackage } from "read-pkg";

import { NoPackageError } from "src/errors/NoPackageError";
import { NoPackageNameError } from "src/errors/NoPackageNameError";

export async function getPackage(pkgRoot: string) {
  try {
    const pkg = await readPackage({
      cwd: pkgRoot,
    });

    if (!pkg.name) {
      throw new NoPackageNameError();
    }

    return pkg;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new AggregateError([new NoPackageError()], "AggregateError");
    }

    throw new AggregateError([error], "AggregateError");
  }
}
