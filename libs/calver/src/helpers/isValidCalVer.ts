import { parseCalVer } from "src/helpers/parseCalVer";
import { CalVerPrereleaseOptions } from "src/schemas/CalVerPrereleaseOptions";

export function isValidCalVer(
  format: string,
  version: string,
  options?: CalVerPrereleaseOptions,
): boolean {
  try {
    parseCalVer(format, version, options);

    return true;
  } catch {
    return false;
  }
}
