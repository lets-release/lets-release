import { z } from "zod";

import { BranchType } from "src/enums/BranchType";
import {
  MaintenanceBranchSpec,
  PrereleaseBranchSpec,
  ReleaseBranchSpec,
} from "src/schemas/BranchSpec";

/**
 * Branches options.
 */
export const BranchesOptions = z.object({
  [BranchType.main]: ReleaseBranchSpec.default("(main|master)"),
  [BranchType.next]: ReleaseBranchSpec.default("next"),
  [BranchType.nextMajor]: ReleaseBranchSpec.default("next-major"),
  [BranchType.maintenance]: z.array(MaintenanceBranchSpec).default([
    "+([0-9])?(.{+([0-9]),x}).x", // semver: N.x, N.x.x, N.N.x
    "+(+([0-9])[._-])?(x[._-])x", // calver
  ]),
  [BranchType.prerelease]: z
    .array(PrereleaseBranchSpec)
    .default(["alpha", "beta", "rc"]),
});

export type BranchesOptions = z.input<typeof BranchesOptions>;

export type NormalizedBranchesOptions = z.output<typeof BranchesOptions>;
