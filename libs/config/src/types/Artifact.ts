import { ArtifactInfo } from "src/schemas/ArtifactInfo";
import { Channel } from "src/schemas/Channel";

/**
 * Details of a release returned by a addChannels or publish plugin.
 */
export interface Artifact extends ArtifactInfo {
  /**
   * The name of the plugin that published the release.
   */
  pluginName: string;

  /**
   * List of channels the release was published to (`null` for default channel).
   */
  channels: Channel[];
}
