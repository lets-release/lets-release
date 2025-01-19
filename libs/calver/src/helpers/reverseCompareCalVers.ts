import { compareCalVers } from "src/helpers/compareCalVers";
import { CalVerPrereleaseOptions } from "src/schemas/CalVerPrereleaseOptions";

/**
 * The reverse of compareCalVers.
 *
 * Sorts in descending order.
 */
export function reverseCompareCalVers(
  format: string,
  a: string,
  b: string,
  options?: CalVerPrereleaseOptions,
) {
  return compareCalVers(format, b, a, options);
}
