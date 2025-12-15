import { isNil } from "lodash-es";

import { compareSemVers } from "src/helpers/compareSemVers";
import { parseSemVer } from "src/helpers/parseSemVer";

export function getEarliestSemVer(
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
        const semver = parseSemVer(version, prereleaseName);

        if (!withPrerelease && isNil(prereleaseName)) {
          return !semver.prereleaseName && isNil(semver.prereleaseNumber);
        }

        return semver.prereleaseName === prereleaseName;
      } catch {
        return false;
      }
    })
    .toSorted((a, b) => compareSemVers(a, b))[0];
}
