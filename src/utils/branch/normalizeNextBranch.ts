import {
  BranchType,
  MainBranch,
  NextBranch,
  Package,
} from "@lets-release/config";
import { increaseSemVer } from "@lets-release/semver";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { getFirstVersion } from "src/utils/branch/getFirstVersion";
import { normalizeReleaseBranch } from "src/utils/branch/normalizeReleaseBranch";

export function normalizeNextBranch(
  packages: Package[],
  main: MainBranch,
  lowerSemVers?: Partial<Record<string, string>>,
  next?: MatchBranchWithTags<BranchType.next>,
  nextMajor?: MatchBranchWithTags<BranchType.nextMajor>,
): {
  branch?: NextBranch;
  latestSemVers: Partial<Record<string, string>>;
} {
  return normalizeReleaseBranch(packages, {
    type: BranchType.next,
    branch: next,
    lowerSemVers,
    getFirstNextSemVer: (pkg) =>
      next && nextMajor
        ? getFirstVersion(pkg, nextMajor, {
            lowerBranches: [main, next],
          })
        : undefined,
    getLowerBound: (pkg) => main.ranges[pkg.uniqueName]?.max,
    getUpperBound: (latest) =>
      nextMajor ? increaseSemVer("major", latest) : undefined,
  });
}
