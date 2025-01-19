import {
  BranchType,
  MainBranch,
  NextBranch,
  NextMajorBranch,
  Package,
} from "@lets-release/config";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { normalizeReleaseBranch } from "src/utils/branch/normalizeReleaseBranch";

export function normalizeNextMajorBranch(
  packages: Package[],
  main: MainBranch,
  nextBranch?: NextBranch,
  lowerSemVers?: Partial<Record<string, string>>,
  nextMajor?: MatchBranchWithTags<BranchType.nextMajor>,
): {
  branch?: NextMajorBranch;
  latestSemVers: Partial<Record<string, string>>;
} {
  return normalizeReleaseBranch(packages, {
    type: BranchType.nextMajor,
    branch: nextMajor,
    lowerSemVers,
    getLowerBound: (pkg) =>
      nextBranch?.ranges[pkg.name]?.max ?? main.ranges[pkg.name]?.max,
  });
}
