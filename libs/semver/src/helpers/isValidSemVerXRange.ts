export function isValidSemVerXRange(range: string) {
  return /^\d+\.((\d+|x)\.)?x$/i.test(range.trim().toLowerCase());
}
