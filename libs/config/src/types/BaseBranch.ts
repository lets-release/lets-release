import { BranchType } from "src/enums/BranchType";
import { BaseBranchObject } from "src/schemas/BranchObject";
import { VersionTag } from "src/types/VersionTag";

/**
 * Base branch
 */
export interface BaseBranch extends BaseBranchObject {
  /**
   * The branch type.
   */
  type: BranchType;

  /**
   * The tags map on this branch (package name as key).
   */
  tags: Record<string, VersionTag[] | undefined>;
}
