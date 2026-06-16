import { compareIdentifiers } from "src/helpers/compareIdentifiers";

export function compareIdentifierLists(
  aList: (string | number)[],
  bList: (string | number)[],
) {
  let i = 0;

  do {
    const a = aList[i];
    const b = bList[i];

    if (a === undefined && b === undefined) {
      return 0;
    }

    if (b === undefined) {
      return 1;
    }

    if (a === undefined) {
      return -1;
    }

    if (a === b) {
      i += 1;
      continue;
    }

    return compareIdentifiers(a, b);
  } while (aList[i] !== undefined || bList[i] !== undefined);

  return 0;
}
