import { isValidSemVer } from "src/helpers/isValidSemVer";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";

export function isValidSemVerPrereleaseName(
  value: string,
  options?: SemVerPrereleaseOptions,
): boolean {
  if (value.startsWith(".")) {
    return false;
  }

  return isValidSemVer(`1.0.0-${value ? `${value}.` : ""}1`, options);
}
