import micromatch from "micromatch";

import { BranchType } from "@lets-release/config";

import { ParsedBranch } from "src/types/ParsedBranch";

const { isMatch } = micromatch;

export function filterParsedBranch(
  type: BranchType,
  pattern: string,
  { name, package: pkgName, range }: ParsedBranch,
) {
  if (name === pattern || isMatch(name, pattern)) {
    return true;
  }

  if (
    type === BranchType.maintenance &&
    pkgName &&
    range &&
    isMatch(range, pattern)
  ) {
    return true;
  }

  return false;
}
