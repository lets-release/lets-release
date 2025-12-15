import { isNil } from "lodash-es";

import { parseSemVer } from "src/helpers/parseSemVer";

export function isValidPrereleaseSemVer(
  version: string,
  prereleaseName?: string,
): boolean {
  try {
    const semver = parseSemVer(version, prereleaseName);

    if (prereleaseName) {
      return prereleaseName === semver.prereleaseName;
    }

    return !!semver.prereleaseName || !isNil(semver.prereleaseNumber);
  } catch {
    return false;
  }
}
