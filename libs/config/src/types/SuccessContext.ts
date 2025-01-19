import { GenerateNotesContext } from "src/types/GenerateNotesContext";
import { HistoricalRelease } from "src/types/HistoricalRelease";

/**
 * Context used for the success step.
 */
export interface SuccessContext extends GenerateNotesContext {
  /**
   * List of artifacts that were created.
   */
  releases: HistoricalRelease[];
}
