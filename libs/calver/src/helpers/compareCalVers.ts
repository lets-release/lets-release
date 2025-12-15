import { isNil } from "lodash-es";

import {
  compareIdentifierLists,
  comparePrereleaseVersions,
} from "@lets-release/versioning";

import { parseCalVer } from "src/helpers/parseCalVer";

/**
 * Compares two versions excluding build identifiers (the bit after `+` in the calendar version string).
 *
 * Sorts in ascending order.
 *
 * @return
 * - `0` if `v1` == `v2`
 * - `1` if `v1` is greater
 * - `-1` if `v2` is greater.
 */
export function compareCalVers(format: string, a: string, b: string) {
  const aCalVer = parseCalVer(format, a);
  const aTokens = [
    aCalVer.tokenValues.year,
    aCalVer.tokenValues.week,
    aCalVer.tokenValues.month,
    aCalVer.tokenValues.day,
    aCalVer.tokenValues.minor,
    aCalVer.tokenValues.micro,
  ].filter((value) => !isNil(value));
  const bCalVer = parseCalVer(format, b);
  const bTokens = [
    bCalVer.tokenValues.year,
    bCalVer.tokenValues.week,
    bCalVer.tokenValues.month,
    bCalVer.tokenValues.day,
    bCalVer.tokenValues.minor,
    bCalVer.tokenValues.micro,
  ].filter((value) => !isNil(value));

  return (
    compareIdentifierLists(aTokens, bTokens) ||
    comparePrereleaseVersions(aCalVer, bCalVer)
  );
}
