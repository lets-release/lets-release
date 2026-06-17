import { TomlValue } from "smol-toml";

import { isArray } from "src/helpers/toml/isArray";

export function isArrayOf<T extends TomlValue>(
  value: TomlValue,
  // eslint-disable-next-line unicorn/consistent-boolean-name
  checker: (value: TomlValue) => value is T,
): value is T[] {
  return isArray(value) && value.every((v) => checker(v));
}
