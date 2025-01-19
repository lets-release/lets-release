import { isNil } from "lodash-es";

import { compareSemVers } from "src/helpers/compareSemVers";
import { parseSemVer } from "src/helpers/parseSemVer";
import { reverseCompareSemVers } from "src/helpers/reverseCompareSemVers";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";

export function getLatestSemVer(
  versions: string[],
  {
    withPrerelease,
    prereleaseName,
    before,
    ...options
  }: SemVerPrereleaseOptions & {
    withPrerelease?: boolean;
    prereleaseName?: string;
    before?: string;
  } = {},
): string | undefined {
  return versions
    .filter((version: string) => {
      const shouldBefore = !isNil(before);
      const isBefore =
        shouldBefore && compareSemVers(version, before, options) < 0;
      const must = !shouldBefore || isBefore;

      if (withPrerelease && isNil(prereleaseName)) {
        return must;
      }

      const semver = parseSemVer(version, options);

      if (!withPrerelease && isNil(prereleaseName)) {
        return must && !semver.prereleaseName && isNil(semver.prereleaseNumber);
      }

      return must && semver.prereleaseName === prereleaseName;
    })
    .toSorted((a, b) => reverseCompareSemVers(a, b, options))[0];
}
