import { compareSemVers } from "src/helpers/compareSemVers";

/**
 * The reverse of compareSemVers.
 *
 * Sorts in descending order.
 */
export function reverseCompareSemVers(a: string, b: string) {
  return compareSemVers(b, a);
}
