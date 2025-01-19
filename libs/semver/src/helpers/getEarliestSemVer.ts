import { isNil } from "lodash-es";

import { compareSemVers } from "src/helpers/compareSemVers";
import { parseSemVer } from "src/helpers/parseSemVer";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";

export function getEarliestSemVer(
  versions: string[],
  {
    withPrerelease,
    prereleaseName,
    ...options
  }: SemVerPrereleaseOptions & {
    withPrerelease?: boolean;
    prereleaseName?: string;
  } = {},
) {
  return versions
    .filter((version: string) => {
      if (withPrerelease && isNil(prereleaseName)) {
        return true;
      }

      const semver = parseSemVer(version, options);

      if (!withPrerelease && isNil(prereleaseName)) {
        return !semver.prereleaseName && isNil(semver.prereleaseNumber);
      }

      return semver.prereleaseName === prereleaseName;
    })
    .toSorted((a, b) => compareSemVers(a, b, options))[0];
}
