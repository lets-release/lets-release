import { BranchType } from "src/enums/BranchType";
import { ReleaseBranch } from "src/types/ReleaseBranch";

/**
 * Main branch.
 */
export interface MainBranch extends ReleaseBranch {
  /**
   * The branch type.
   */
  type: BranchType.main;
}
