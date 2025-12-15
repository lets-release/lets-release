import { isNil } from "lodash-es";

import { parseCalVer } from "src/helpers/parseCalVer";

export function isValidPrereleaseCalVer(
  format: string,
  version: string,
  prereleaseName?: string,
): boolean {
  try {
    const calver = parseCalVer(format, version, prereleaseName);

    if (prereleaseName) {
      return prereleaseName === calver.prereleaseName;
    }

    return !!calver.prereleaseName || !isNil(calver.prereleaseNumber);
  } catch {
    return false;
  }
}
