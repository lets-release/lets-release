import { BranchType } from "@lets-release/config";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { normalizePrereleaseBranches } from "src/utils/branch/normalizePrereleaseBranches";

describe("normalizePrereleaseBranches", () => {
  it("should normalize prerelease branches", () => {
    expect(normalizePrereleaseBranches([{}] as MatchBranchWithTags[])).toEqual([
      {
        type: BranchType.prerelease,
      },
    ]);
  });
});
