import { REGULAR_EXPRESSIONS } from "src/constants/REGULAR_EXPRESSIONS";

const { PRERELEASE } = REGULAR_EXPRESSIONS;

export function isValidCalVerPrereleaseName(value: string): boolean {
  return new RegExp(`^${PRERELEASE}$`).test(value);
}
