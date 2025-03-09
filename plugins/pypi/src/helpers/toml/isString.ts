import { TomlPrimitive } from "smol-toml";

export function isString(value: TomlPrimitive): value is string {
  return typeof value === "string";
}
