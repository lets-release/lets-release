import { TomlPrimitive } from "smol-toml";

export function getMaybeValue<T extends TomlPrimitive>(
  value: TomlPrimitive | undefined,
  checker: (value: TomlPrimitive) => value is T,
): T | undefined {
  if (value !== undefined && checker(value)) {
    return value;
  }
}
