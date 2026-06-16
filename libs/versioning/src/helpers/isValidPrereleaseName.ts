import { REGULAR_EXPRESSIONS } from "src/constants/REGULAR_EXPRESSIONS";

const { PRERELEASE } = REGULAR_EXPRESSIONS;

export function isValidPrereleaseName(value: string): boolean {
  // An empty prerelease name is valid
  if (!value) {
    return true;
  }

  const regExp = new RegExp(`^${PRERELEASE}$`);

  return regExp.test(`-${value}`);
}
