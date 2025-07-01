import { template } from "lodash-es";
import { TomlValue } from "smol-toml";

import { BaseContext } from "@lets-release/config";

import { getMaybeValue } from "src/helpers/toml/getMaybeValue";
import { isObject } from "src/helpers/toml/isObject";
import { isString } from "src/helpers/toml/isString";
import { PyPIRegistry } from "src/types/PyPIRegistry";

export function normalizeRegistry(
  { env }: Pick<BaseContext, "env">,
  registry?: TomlValue,
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
    url: url ? template(url)(env) : undefined,
    publishUrl: template(publishUrl)(env),
  };
}
