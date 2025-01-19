import { BranchType } from "src/enums/BranchType";
import { ReleaseBranch } from "src/types/ReleaseBranch";

/**
 * Next branch.
 */
export interface NextBranch extends ReleaseBranch {
  /**
   * The branch type.
   */
  type: BranchType.next;
}
