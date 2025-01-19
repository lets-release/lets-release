import { BaseBranch, BranchType } from "@lets-release/config";

import { MatchBranch } from "src/types/MatchBranch";

export type MatchBranchWithTags<T extends BranchType = BranchType> =
  MatchBranch<T> & Pick<BaseBranch, "tags">;
