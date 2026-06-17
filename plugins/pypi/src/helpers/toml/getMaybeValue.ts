import { TomlValue } from "smol-toml";

export function getMaybeValue<T extends TomlValue>(
  value: TomlValue | undefined,
  // eslint-disable-next-line unicorn/consistent-boolean-name
  checker: (value: TomlValue) => value is T,
): T | undefined {
  if (value !== undefined && checker(value)) {
    return value;
  }
}
