import {
  LetsReleaseError,
  MaintenanceVersionRange,
  NormalizedNextRelease,
  Package,
} from "@lets-release/config";

import { getRange } from "src/utils/branch/getRange";

export class InvalidMaintenanceMergeError extends LetsReleaseError {
  get message() {
    return `The release \`${this.release.version}\` of package \`${this.pkg.name}\` on branch \`${this.branch}\` cannot be published as it is out of range.`;
  }

  get details() {
    return `Only releases within the range \`${getRange(this.range.mergeMin, this.range.mergeMax)}\` of package \`${this.pkg.name}\` can be merged into the maintenance branch \`${this.branch}\` and published to the \`${JSON.stringify(this.release.channels)}\` distribution channels.

The branch \`${this.branch}\` head should be [reset][] to a previous commit so the commit with tag \`${this.release.tag}\` is removed from the branch history.

[reset]: https://git-scm.com/docs/git-reset`;
  }

  constructor(
    readonly pkg: Package,
    private range: MaintenanceVersionRange,
    private branch: string,
    private release: NormalizedNextRelease,
  ) {
    super();
  }
}
