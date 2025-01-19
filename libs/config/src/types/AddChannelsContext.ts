import { GenerateNotesContext } from "src/types/GenerateNotesContext";
import { HistoricalRelease } from "src/types/HistoricalRelease";

/**
 * Context used for the add channel step.
 */
export interface AddChannelsContext extends GenerateNotesContext {
  /**
   * Current release that needed to add channel.
   */
  currentRelease: HistoricalRelease;
}
