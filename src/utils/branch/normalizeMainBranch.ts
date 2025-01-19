import { BranchType, MainBranch, Package } from "@lets-release/config";
import { increaseSemVer } from "@lets-release/semver";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { getFirstVersion } from "src/utils/branch/getFirstVersion";
import { normalizeReleaseBranch } from "src/utils/branch/normalizeReleaseBranch";

export function normalizeMainBranch(
  packages: Package[],
  main: MatchBranchWithTags<BranchType.main>,
  next?: MatchBranchWithTags<BranchType.next>,
  nextMajor?: MatchBranchWithTags<BranchType.nextMajor>,
): { branch?: MainBranch; latestSemVers: Partial<Record<string, string>> } {
  return normalizeReleaseBranch(packages, {
    type: BranchType.main,
    branch: main,
    getFirstNextSemVer: (pkg) => {
      if (main) {
        const nextMajorSemVer = nextMajor
          ? getFirstVersion(pkg, nextMajor, {
              lowerBranches: [main],
            })
          : undefined;

        return next
          ? (getFirstVersion(pkg, next, {
              lowerBranches: [main],
            }) ?? nextMajorSemVer)
          : nextMajorSemVer;
      }
    },
    getUpperBound: (latest) =>
      next && nextMajor
        ? increaseSemVer("minor", latest)
        : next || nextMajor
          ? increaseSemVer("major", latest)
          : undefined,
  });
}
