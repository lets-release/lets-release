import { BranchType } from "src/enums/BranchType";
import { ReleaseBranch } from "src/types/ReleaseBranch";

/**
 * Next major branch.
 */
export interface NextMajorBranch extends ReleaseBranch {
  /**
   * The branch type.
   */
  type: BranchType.nextMajor;
}
