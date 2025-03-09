import { TomlDate, TomlPrimitive } from "smol-toml";

import { isArray } from "src/helpers/toml/isArray";

export function isObject(
  value: TomlPrimitive,
): value is Record<string, TomlPrimitive> {
  return (
    typeof value === "object" && !(value instanceof TomlDate) && !isArray(value)
  );
}
