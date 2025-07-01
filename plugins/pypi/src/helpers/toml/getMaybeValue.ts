import { TomlValue } from "smol-toml";

export function getMaybeValue<T extends TomlValue>(
  value: TomlValue | undefined,
  checker: (value: TomlValue) => value is T,
): T | undefined {
  if (value !== undefined && checker(value)) {
    return value;
  }
}
