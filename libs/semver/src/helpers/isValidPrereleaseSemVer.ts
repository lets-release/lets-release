import { isNil } from "lodash-es";

import { parseSemVer } from "src/helpers/parseSemVer";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";

export function isValidPrereleaseSemVer(
  version: string,
  options?: SemVerPrereleaseOptions & { prereleaseName?: string },
): boolean {
  try {
    const { prereleaseName, prereleaseNumber } = parseSemVer(version, options);

    if (options?.prereleaseName) {
      return prereleaseName === options.prereleaseName;
    }

    return !!prereleaseName || !isNil(prereleaseNumber);
  } catch {
    return false;
  }
}
