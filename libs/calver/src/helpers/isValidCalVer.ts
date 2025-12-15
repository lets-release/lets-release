import { parseCalVer } from "src/helpers/parseCalVer";

export function isValidCalVer(
  format: string,
  version: string,
  prereleaseName?: string,
): boolean {
  try {
    parseCalVer(format, version, prereleaseName);

    return true;
  } catch {
    return false;
  }
}
