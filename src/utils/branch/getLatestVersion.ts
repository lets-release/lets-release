import { Package } from "@lets-release/config";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { getDescendingVersions } from "src/utils/branch/getDescendingVersions";

export function getLatestVersion(
  pkg: Package,
  branch: Pick<MatchBranchWithTags, "tags">,
  { withPrerelease }: { withPrerelease?: boolean } = {},
): string | undefined {
  return getDescendingVersions(pkg, branch, { withPrerelease })[0];
}
