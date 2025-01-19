import {
  NormalizedPrereleaseOptions,
  VersioningScheme,
} from "@lets-release/config";

export function getNormalizedPrereleaseName(
  options: NormalizedPrereleaseOptions,
  scheme: VersioningScheme,
  pluginName?: string,
) {
  if ("name" in options) {
    return pluginName && options.name[pluginName]
      ? options.name[pluginName]
      : options.name.default;
  }

  const spec = options.names[scheme];

  return pluginName && spec[pluginName] ? spec[pluginName] : spec.default;
}
