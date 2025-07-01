import { TomlValue } from "smol-toml";

export function isArray(value: TomlValue): value is TomlValue[] {
  return Array.isArray(value);
}
