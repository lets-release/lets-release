import { REGULAR_EXPRESSIONS } from "src/constants/REGULAR_EXPRESSIONS";

const { BUILD } = REGULAR_EXPRESSIONS;

export function isValidBuildMetadata(value: string): boolean {
  const regExp = new RegExp(`^${BUILD}$`);

  return regExp.test(`+${value}`);
}
