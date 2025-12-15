import { isNil } from "lodash-es";

import { compareSemVers } from "src/helpers/compareSemVers";
import { parseSemVer } from "src/helpers/parseSemVer";
import { reverseCompareSemVers } from "src/helpers/reverseCompareSemVers";

export function getLatestSemVer(
  versions: string[],
  {
    withPrerelease,
    prereleaseName,
    before,
  }: {
    withPrerelease?: boolean;
    prereleaseName?: string;
    before?: string;
  } = {},
): string | undefined {
  return versions
    .filter((version: string) => {
      const shouldBefore = !isNil(before);
      const isBefore = shouldBefore && compareSemVers(version, before) < 0;
      const must = !shouldBefore || isBefore;

      if (withPrerelease && isNil(prereleaseName)) {
        return must;
      }

      try {
        const semver = parseSemVer(version, prereleaseName);

        if (!withPrerelease && isNil(prereleaseName)) {
          return (
            must && !semver.prereleaseName && isNil(semver.prereleaseNumber)
          );
        }

        return must && semver.prereleaseName === prereleaseName;
      } catch {
        return false;
      }
    })
    .toSorted((a, b) => reverseCompareSemVers(a, b))[0];
}
