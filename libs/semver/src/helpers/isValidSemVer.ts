import { parseSemVer } from "src/helpers/parseSemVer";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";

export function isValidSemVer(
  version: string,
  options?: SemVerPrereleaseOptions,
): boolean {
  try {
    parseSemVer(version, options);

    return true;
  } catch {
    return false;
  }
}
