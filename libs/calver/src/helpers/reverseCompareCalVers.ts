import { compareCalVers } from "src/helpers/compareCalVers";

/**
 * The reverse of compareCalVers.
 *
 * Sorts in descending order.
 */
export function reverseCompareCalVers(format: string, a: string, b: string) {
  return compareCalVers(format, b, a);
}
