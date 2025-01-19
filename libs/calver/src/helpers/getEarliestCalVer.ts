import { isNil } from "lodash-es";

import { compareCalVers } from "src/helpers/compareCalVers";
import { parseCalVer } from "src/helpers/parseCalVer";
import { CalVerPrereleaseOptions } from "src/schemas/CalVerPrereleaseOptions";

export function getEarliestCalVer(
  format: string,
  versions: string[],
  {
    withPrerelease,
    prereleaseName,
    ...options
  }: CalVerPrereleaseOptions & {
    withPrerelease?: boolean;
    prereleaseName?: string;
  } = {},
) {
  return versions
    .filter((version: string) => {
      if (withPrerelease && isNil(prereleaseName)) {
        return true;
      }

      const calver = parseCalVer(format, version, options);

      if (!withPrerelease && isNil(prereleaseName)) {
        return !calver.prereleaseName && isNil(calver.prereleaseNumber);
      }

      return calver.prereleaseName === prereleaseName;
    })
    .toSorted((a, b) => compareCalVers(format, a, b, options))[0];
}
