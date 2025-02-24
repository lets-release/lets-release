import {
  Commit,
  LetsReleaseError,
  Package,
  ReleaseBranch,
  ReleaseVersionRange,
} from "@lets-release/config";

import { getRange } from "src/utils/branch/getRange";

export class InvalidNextVersionError extends LetsReleaseError {
  get message() {
    return `The release \`${this.version}\` of package \`${this.pkg.uniqueName}\` on branch \`${this.branch.name}\` cannot be published as it is out of range.`;
  }

  get details() {
    const branches = this.validBranches?.map(({ name }) => `\`${name}\``);

    return `Based on the releases of package \`${this.pkg.uniqueName}\` published, only versions within the range \`${getRange(this.range.min, this.range.max)}\` can be published from branch \`${this.branch.name}\`.

The following commit${this.commits.length > 1 ? "s are" : " is"} responsible for the invalid release:
${this.commits.map(({ commit: { short }, subject }) => `- ${subject} (${short})`).join("\n")}

${
  this.commits.length > 1 ? "Those commits" : "This commit"
} should be moved to a valid branch with [git merge][] or [git cherry-pick][] and removed from branch \`${this.branch.name}\` with [git revert] or [git reset][].

${
  branches?.length
    ? `A valid branch could be ${branches.slice(0, -1).join(", ")}${branches.length > 1 ? ` or ${branches.at(-1)}` : branches[0].trim()}.
`
    : ""
}

[git merge]: https://git-scm.com/docs/git-merge
[git cherry-pick]: https://git-scm.com/docs/git-cherry-pick
[git revert]: https://git-scm.com/docs/git-revert
[git reset]: https://git-scm.com/docs/git-reset`;
  }

  constructor(
    readonly pkg: Package,
    private range: ReleaseVersionRange,
    private version: string,
    private branch: ReleaseBranch,
    private commits: Commit[],
    private validBranches?: ReleaseBranch[],
  ) {
    super();
  }
}
