export function isValidSemVerMajorXRange(range: string) {
  return /^\d+\.x(\.x)?$/i.test(range.trim().toLowerCase());
}
