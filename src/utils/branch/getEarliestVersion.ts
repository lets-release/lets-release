import { Package } from "@lets-release/config";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { getAscendingVersions } from "src/utils/branch/getAscendingVersions";

export function getEarliestVersion(
  pkg: Package,
  branch: Pick<MatchBranchWithTags, "tags">,
  { withPrerelease }: { withPrerelease?: boolean } = {},
): string | undefined {
  return getAscendingVersions(pkg, branch, { withPrerelease })[0];
}
