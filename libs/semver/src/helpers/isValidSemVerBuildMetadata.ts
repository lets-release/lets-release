import { isValidSemVer } from "src/helpers/isValidSemVer";

export function isValidSemVerBuildMetadata(value: string): boolean {
  return isValidSemVer(`1.0.0+${value}`);
}
