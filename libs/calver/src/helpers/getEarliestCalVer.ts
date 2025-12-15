import { isNil } from "lodash-es";

import { compareCalVers } from "src/helpers/compareCalVers";
import { parseCalVer } from "src/helpers/parseCalVer";

export function getEarliestCalVer(
  format: string,
  versions: string[],
  {
    withPrerelease,
    prereleaseName,
  }: {
    withPrerelease?: boolean;
    prereleaseName?: string;
  } = {},
) {
  return versions
    .filter((version: string) => {
      if (withPrerelease && isNil(prereleaseName)) {
        return true;
      }

      try {
        const calver = parseCalVer(format, version, prereleaseName);

        if (!withPrerelease && isNil(prereleaseName)) {
          return !calver.prereleaseName && isNil(calver.prereleaseNumber);
        }

        return calver.prereleaseName === prereleaseName;
      } catch {
        return false;
      }
    })
    .toSorted((a, b) => compareCalVers(format, a, b))[0];
}
