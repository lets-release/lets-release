import { TomlValue } from "smol-toml";

export function isString(value: TomlValue): value is string {
  return typeof value === "string";
}
