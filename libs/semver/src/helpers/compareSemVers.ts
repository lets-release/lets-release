import {
  compareIdentifiers,
  comparePrereleaseVersions,
} from "@lets-release/versioning";

import { parseSemVer } from "src/helpers/parseSemVer";

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
export function compareSemVers(a: string, b: string) {
  const aSemVer = parseSemVer(a);
  const bSemVer = parseSemVer(b);

  return (
    compareIdentifiers(aSemVer.major, bSemVer.major) ||
    compareIdentifiers(aSemVer.minor, bSemVer.minor) ||
    compareIdentifiers(aSemVer.patch, bSemVer.patch) ||
    comparePrereleaseVersions(aSemVer, bSemVer)
  );
}
