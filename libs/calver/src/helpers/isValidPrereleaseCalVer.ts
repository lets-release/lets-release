import { isNil } from "lodash-es";

import { parseCalVer } from "src/helpers/parseCalVer";
import { CalVerPrereleaseOptions } from "src/schemas/CalVerPrereleaseOptions";

export function isValidPrereleaseCalVer(
  format: string,
  version: string,
  options?: CalVerPrereleaseOptions & { prereleaseName?: string },
): boolean {
  try {
    const { prereleaseName, prereleaseNumber } = parseCalVer(
      format,
      version,
      options,
    );

    if (options?.prereleaseName) {
      return prereleaseName === options.prereleaseName;
    }

    return !!prereleaseName || !isNil(prereleaseNumber);
  } catch {
    return false;
  }
}
