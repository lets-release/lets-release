import { z } from "zod";

import { PackageInfo } from "src/schemas/PackageInfo";

/**
 * Result of findingPackages step.
 */
export const FindPackagesResult = z.array(PackageInfo).optional();

export type FindPackagesResult = z.infer<typeof FindPackagesResult>;
