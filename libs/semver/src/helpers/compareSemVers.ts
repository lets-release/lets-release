import {
  compareIdentifiers,
  comparePrereleaseVersions,
} from "@lets-release/versioning";

import { parseSemVer } from "src/helpers/parseSemVer";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";

/**
 * Compares two versions excluding build identifiers (the bit after `+` in the semantic version string).
 *
 * Sorts in ascending order.
 *
 * @return
 * - `0` if `v1` == `v2`
 * - `1` if `v1` is greater
 * - `-1` if `v2` is greater.
 */
export function compareSemVers(
  a: string,
  b: string,
  options?: SemVerPrereleaseOptions,
) {
  const aSemVer = parseSemVer(a, options);
  const bSemVer = parseSemVer(b, options);

  return (
    compareIdentifiers(aSemVer.major, bSemVer.major) ||
    compareIdentifiers(aSemVer.minor, bSemVer.minor) ||
    compareIdentifiers(aSemVer.patch, bSemVer.patch) ||
    comparePrereleaseVersions(aSemVer, bSemVer)
  );
}
