import { isNil } from "lodash-es";

import { compareCalVers } from "src/helpers/compareCalVers";
import { parseCalVer } from "src/helpers/parseCalVer";
import { reverseCompareCalVers } from "src/helpers/reverseCompareCalVers";
import { CalVerPrereleaseOptions } from "src/schemas/CalVerPrereleaseOptions";

export function getLatestCalVer(
  format: string,
  versions: string[],
  {
    withPrerelease,
    prereleaseName,
    before,
    ...options
  }: CalVerPrereleaseOptions & {
    withPrerelease?: boolean;
    prereleaseName?: string;
    before?: string;
  } = {},
): string | undefined {
  return versions
    .filter((version: string) => {
      const shouldBefore = !isNil(before);
      const isBefore =
        shouldBefore && compareCalVers(format, version, before, options) < 0;
      const must = !shouldBefore || isBefore;

      if (withPrerelease && isNil(prereleaseName)) {
        return must;
      }

      const calver = parseCalVer(format, version, options);

      if (!withPrerelease && isNil(prereleaseName)) {
        return must && !calver.prereleaseName && isNil(calver.prereleaseNumber);
      }

      return must && calver.prereleaseName === prereleaseName;
    })
    .toSorted((a, b) => reverseCompareCalVers(format, a, b, options))[0];
}
