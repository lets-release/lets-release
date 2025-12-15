import { parseSemVer } from "src/helpers/parseSemVer";

export function isValidSemVer(
  version: string,
  prereleaseName?: string,
): boolean {
  try {
    parseSemVer(version, prereleaseName);

    return true;
  } catch {
    return false;
  }
}
