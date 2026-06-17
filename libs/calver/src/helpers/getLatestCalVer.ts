import { isNil } from "lodash-es";

import { compareCalVers } from "src/helpers/compareCalVers";
import { parseCalVer } from "src/helpers/parseCalVer";
import { reverseCompareCalVers } from "src/helpers/reverseCompareCalVers";

export function getLatestCalVer(
  format: string,
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
      const isBefore =
        shouldBefore && compareCalVers(format, version, before) < 0;
      const isMust = !shouldBefore || isBefore;

      if (withPrerelease && isNil(prereleaseName)) {
        return isMust;
      }

      try {
        const calver = parseCalVer(format, version, prereleaseName);

        if (!withPrerelease && isNil(prereleaseName)) {
          return (
            isMust && !calver.prereleaseName && isNil(calver.prereleaseNumber)
          );
        }

        return isMust && calver.prereleaseName === prereleaseName;
      } catch {
        return false;
      }
    })
    .toSorted((a, b) => reverseCompareCalVers(format, a, b))[0];
}
