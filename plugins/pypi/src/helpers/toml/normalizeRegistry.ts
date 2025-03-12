import { TomlPrimitive } from "smol-toml";

import { getMaybeValue } from "src/helpers/toml/getMaybeValue";
import { isObject } from "src/helpers/toml/isObject";
import { isString } from "src/helpers/toml/isString";
import { PyPIRegistry } from "src/types/PyPIRegistry";

export function normalizeRegistry(
  registry?: TomlPrimitive,
): PyPIRegistry | undefined {
  if (!registry || !isObject(registry)) {
    return;
  }

  const name = getMaybeValue(registry.name, isString);
  const url = getMaybeValue(registry.url, isString);
  const publishUrl = getMaybeValue(registry["publish-url"], isString);

  if (!publishUrl) {
    return;
  }

  return {
    name,
    url,
    publishUrl,
  };
}
