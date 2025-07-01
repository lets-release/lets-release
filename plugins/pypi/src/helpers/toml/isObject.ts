import { TomlDate, TomlValue } from "smol-toml";

import { isArray } from "src/helpers/toml/isArray";

export function isObject(value: TomlValue): value is Record<string, TomlValue> {
  return (
    typeof value === "object" && !(value instanceof TomlDate) && !isArray(value)
  );
}
