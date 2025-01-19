import { compareSemVers } from "src/helpers/compareSemVers";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";

/**
 * The reverse of compareSemVers.
 *
 * Sorts in descending order.
 */
export function reverseCompareSemVers(
  a: string,
  b: string,
  options?: SemVerPrereleaseOptions,
) {
  return compareSemVers(b, a, options);
}
