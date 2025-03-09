import { TomlPrimitive } from "smol-toml";

import { getMaybeValue } from "src/helpers/toml/getMaybeValue";
import { isArray } from "src/helpers/toml/isArray";
import { isString } from "src/helpers/toml/isString";
import { normalizeRegistry } from "src/helpers/toml/normalizeRegistry";

export function normalizeUv(raw: Record<string, TomlPrimitive>) {
  const index = getMaybeValue(raw.index, isArray)?.flatMap((r) => {
    const normalized = normalizeRegistry(r);

    if (normalized) {
      return [normalized];
    }

    return [];
  });
  const checkUrl = getMaybeValue(raw["check-url"], isString);
  const publishUrl = getMaybeValue(raw["publish-url"], isString);
  const devDependencies = getMaybeValue(
    raw["dev-dependencies"],
    isArray,
  )?.filter(isString);

  return {
    index,
    checkUrl,
    publishUrl,
    devDependencies,
  };
}
