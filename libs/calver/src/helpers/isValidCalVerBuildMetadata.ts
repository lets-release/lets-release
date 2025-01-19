import { REGULAR_EXPRESSIONS } from "src/constants/REGULAR_EXPRESSIONS";

const { BUILD } = REGULAR_EXPRESSIONS;

export function isValidCalVerBuildMetadata(value: string): boolean {
  return new RegExp(`^${BUILD}$`).test(value);
}
