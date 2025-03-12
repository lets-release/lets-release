import { TomlPrimitive } from "smol-toml";

export function isArray(value: TomlPrimitive): value is TomlPrimitive[] {
  return Array.isArray(value);
}
