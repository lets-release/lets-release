export function compareIdentifiers(a: number | string, b: number | string) {
  if (a === b) {
    return 0;
  }

  const isANumber = typeof a === "number";
  const isBNumber = typeof b === "number";

  if (isANumber && !isBNumber) {
    return -1;
  }

  if (!isANumber && isBNumber) {
    return 1;
  }

  return a < b ? -1 : 1;
}
