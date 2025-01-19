import { Channel } from "src/schemas/Channel";
import { NormalizedChannels } from "src/schemas/Channels";
import { HistoricalRelease } from "src/types/HistoricalRelease";

/**
 * Next release.
 */
export interface NextRelease extends HistoricalRelease {
  /**
   * List of channels the release was published to (`null` for default channel).
   *
   * Plugin name as key.
   */
  channels: Channel[];

  /**
   * The release notes.
   */
  notes?: string;
}

export interface NormalizedNextRelease extends Omit<NextRelease, "channels"> {
  channels: NormalizedChannels;
}
