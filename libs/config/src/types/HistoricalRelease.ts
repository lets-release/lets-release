import { VersionTag } from "src/types/VersionTag";

/**
 * Historical release.
 */
export interface HistoricalRelease extends Omit<VersionTag, "package"> {
  /**
   * The git hash of the last commit of the release.
   */
  hash: string;
}
