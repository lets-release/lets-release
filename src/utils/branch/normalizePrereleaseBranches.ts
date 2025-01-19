import { BranchType, PrereleaseBranch } from "@lets-release/config";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";

export function normalizePrereleaseBranches(
  branches?: MatchBranchWithTags[],
): PrereleaseBranch[] | undefined {
  return branches?.map(
    (branch) =>
      ({
        ...branch,
        type: BranchType.prerelease,
      }) as PrereleaseBranch,
  );
}
