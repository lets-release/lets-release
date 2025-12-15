import { formatSemVer } from "src/helpers/formatSemVer";
import { isValidSemVerXRange } from "src/helpers/isValidSemVerXRange";
import { ParsedSemVerXRange } from "src/types/ParsedSemVerXRange";

export function parseSemVerXRange(range: string): ParsedSemVerXRange {
  if (!isValidSemVerXRange(range)) {
    throw new TypeError(`Invalid SemVer X range: ${range}`);
  }

  const parts = range.trim().toLowerCase().split(".");
  const major = Number(parts[0]);
  const minor = /^x$/i.test(parts[1]) ? "*" : Number(parts[1]);
  const patch = parts[2] && /^x$/i.test(parts[2]) ? "*" : undefined;

  return {
    major,
    minor,
    patch,
    min: formatSemVer({
      major,
      minor: minor === "*" ? 0 : minor,
      patch: 0,
    }),
    max: formatSemVer({
      major: minor === "*" ? major + 1 : major,
      minor: minor === "*" ? 0 : minor + 1,
      patch: 0,
    }),
  };
}
