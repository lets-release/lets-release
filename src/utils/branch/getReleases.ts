import {
  BaseContext,
  MainBranch,
  MaintenanceBranch,
  NextBranch,
  NextMajorBranch,
  Package,
  PrereleaseBranch,
  VersionTag,
} from "@lets-release/config";

import { filterTag } from "src/utils/branch/filterTag";
import { sortPackageVersions } from "src/utils/branch/sortPackageVersions";

/**
 * Get releases on the branch.
 *
 * - Filter out the branch tags that are not valid semantic or calendar version
 * - Sort the versions
 */
export function getReleases(
  { options }: Pick<BaseContext, "options">,
  branch:
    | MainBranch
    | NextBranch
    | NextMajorBranch
    | MaintenanceBranch
    | PrereleaseBranch,
  packages: Package[],
  before?: Record<string, string | undefined>,
): Record<string, VersionTag[] | undefined> {
  return Object.fromEntries(
    packages.map((pkg) => [
      pkg.name,
      sortPackageVersions(
        pkg,
        branch.tags[pkg.name]?.filter(({ version, artifacts }) =>
          filterTag(
            { options },
            branch,
            pkg,
            { version, artifacts },
            before?.[pkg.name],
          ),
        ) ?? [],
        "desc",
      ),
    ]),
  );
}
