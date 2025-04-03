import micromatch from "micromatch";

import { BranchType } from "@lets-release/config";

import { ParsedBranch } from "src/types/ParsedBranch";

export function filterParsedBranch(
  type: BranchType,
  pattern: string,
  { name, package: pkgName, range }: ParsedBranch,
) {
  if (name === pattern || micromatch.isMatch(name, pattern)) {
    return true;
  }

  if (
    type === BranchType.maintenance &&
    pkgName &&
    range &&
    micromatch.isMatch(range, pattern)
  ) {
    return true;
  }

  return false;
}
