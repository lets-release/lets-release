import { Channel, PrereleaseBranch, ReleaseBranch } from "@lets-release/config";

import { getNormalizedChannels } from "src/utils/branch/getNormalizedChannels";

export function getPluginChannels(
  branch: PrereleaseBranch | ReleaseBranch,
  pluginName?: string,
  prerelease?: string,
): Channel[] {
  const normalizedChannels = getNormalizedChannels(branch, prerelease);

  if (pluginName && normalizedChannels[pluginName]) {
    return normalizedChannels[pluginName];
  }

  return normalizedChannels.default;
}
