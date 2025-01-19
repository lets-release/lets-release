import { BranchType } from "src/enums/BranchType";
import { MainBranch } from "src/types/MainBranch";
import { MaintenanceBranch } from "src/types/MaintenanceBranch";
import { NextBranch } from "src/types/NextBranch";
import { NextMajorBranch } from "src/types/NextMajorBranch";
import { PrereleaseBranch } from "src/types/PrereleaseBranch";

export interface Branches {
  [BranchType.main]?: MainBranch;
  [BranchType.next]?: NextBranch;
  [BranchType.nextMajor]?: NextMajorBranch;
  [BranchType.maintenance]?: MaintenanceBranch[];
  [BranchType.prerelease]?: PrereleaseBranch[];
}
