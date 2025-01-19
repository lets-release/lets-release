import { BranchType } from "src/enums/BranchType";
import { NormalizedPrereleaseOptions } from "src/schemas/PrereleaseOptions";
import { BaseBranch } from "src/types/BaseBranch";

/**
 * Prerelease branch on the repository.
 */
export interface PrereleaseBranch extends BaseBranch {
  /**
   * The branch type.
   */
  type: BranchType.prerelease;

  /**
   * The prerelease options.
   */
  prerelease: NormalizedPrereleaseOptions;
}
