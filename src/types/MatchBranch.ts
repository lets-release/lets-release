import {
  BranchType,
  MainBranch,
  MaintenanceBranch,
  NextBranch,
  NextMajorBranch,
  PrereleaseBranch,
  Ranges,
} from "@lets-release/config";

type MatchMainBranch = Omit<MainBranch, "ranges" | "tags">;

type MatchNextBranch = Omit<NextBranch, "ranges" | "tags">;

type MatchNextMajorBranch = Omit<NextMajorBranch, "ranges" | "tags">;

export type MatchMaintenanceBranch = Omit<
  MaintenanceBranch,
  "ranges" | "tags"
> & { ranges: Ranges };

export type MatchPrereleaseBranch = Omit<PrereleaseBranch, "tags">;

export type MatchBranch<T extends BranchType = BranchType> = {
  [BranchType.main]: MatchMainBranch;
  [BranchType.next]: MatchNextBranch;
  [BranchType.nextMajor]: MatchNextMajorBranch;
  [BranchType.maintenance]: MatchMaintenanceBranch;
  [BranchType.prerelease]: MatchPrereleaseBranch;
}[T];
