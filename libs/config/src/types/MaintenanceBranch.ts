import { BranchType } from "src/enums/BranchType";
import { MaintenanceVersionRange } from "src/types/MaintenanceVersionRange";
import { ReleaseBranch } from "src/types/ReleaseBranch";

/**
 * Maintenance branch on the repository.
 */
export interface MaintenanceBranch extends ReleaseBranch {
  /**
   * The branch type.
   */
  type: BranchType.maintenance;

  /**
   * The package version ranges (package name as key).
   */
  ranges: Record<string, MaintenanceVersionRange | undefined>;
}
