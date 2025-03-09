import path from "node:path";

import { NoPyPIPackageError } from "src/errors/NoPyPIPackageError";
import { normalizePyProjectToml } from "src/helpers/normalizePyProjectToml";
import { readTomlFile } from "src/helpers/toml/readTomlFile";

export async function getPackage(pkgRoot: string) {
  try {
    return normalizePyProjectToml(
      await readTomlFile(path.resolve(pkgRoot, "pyproject.toml")),
    );
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new NoPyPIPackageError();
    }

    throw error;
  }
}
