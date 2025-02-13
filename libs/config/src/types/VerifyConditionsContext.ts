import { Branches } from "src/types/Branches";
import { FindPackagesContext } from "src/types/FindPackagesContext";
import { MainBranch } from "src/types/MainBranch";
import { MaintenanceBranch } from "src/types/MaintenanceBranch";
import { NextBranch } from "src/types/NextBranch";
import { NextMajorBranch } from "src/types/NextMajorBranch";
import { Package } from "src/types/Package";
import { PrereleaseBranch } from "src/types/PrereleaseBranch";

/**
 * Context used for the verify conditions step.
 */
export interface VerifyConditionsContext extends FindPackagesContext {
  /**
   * List of packages found in the repository.
   */
  packages: Package[];

  /**
   * Information on branches
   */
  branches: Branches;

  /**
   * Information of the current branch
   */
  branch:
    | MainBranch
    | NextBranch
    | NextMajorBranch
    | MaintenanceBranch
    | PrereleaseBranch;
}
