import { isArray } from "lodash-es";

import { PluginObject, PluginSpec } from "@lets-release/config";

export function parsePluginSpec<T extends object = object>(
  spec: PluginSpec<T>,
): [string | PluginObject, T] {
  let plugin: string | PluginObject;
  let options: T | undefined;

  if (isArray(spec)) {
    [plugin, options] = spec;
  } else {
    plugin = spec;
  }

  return [plugin, options ?? ({} as T)];
}
