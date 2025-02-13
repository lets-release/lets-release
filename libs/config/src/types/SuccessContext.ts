import { HistoricalRelease } from "src/types/HistoricalRelease";
import { PublishContext } from "src/types/PublishContext";

/**
 * Context used for the success step.
 */
export interface SuccessContext extends PublishContext {
  /**
   * List of artifacts that were created.
   */
  releases: HistoricalRelease[];
}
