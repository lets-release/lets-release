import { NormalizedPrereleaseOptions } from "@lets-release/config";

export function getNormalizedPrereleaseName(
  options: NormalizedPrereleaseOptions,
  pluginName?: string,
) {
  return pluginName && options.name[pluginName]
    ? options.name[pluginName]
    : options.name.default;
}
