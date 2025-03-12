import { TomlPrimitive } from "smol-toml";

import { isArray } from "src/helpers/toml/isArray";

export function isArrayOf<T extends TomlPrimitive>(
  value: TomlPrimitive,
  checker: (value: TomlPrimitive) => value is T,
): value is T[] {
  return isArray(value) && value.every((v) => checker(v));
}
