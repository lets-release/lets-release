import { template } from "lodash-es";
import { TomlValue } from "smol-toml";

import { BaseContext } from "@lets-release/config";

import { getMaybeValue } from "src/helpers/toml/getMaybeValue";
import { isArray } from "src/helpers/toml/isArray";
import { isString } from "src/helpers/toml/isString";
import { normalizeRegistry } from "src/helpers/toml/normalizeRegistry";

export function normalizeUv(
  { env }: Pick<BaseContext, "env">,
  raw: Record<string, TomlValue>,
) {
  const index = getMaybeValue(raw.index, isArray)?.flatMap((r) => {
    const normalized = normalizeRegistry({ env }, r);

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
    checkUrl: checkUrl ? template(checkUrl)(env) : undefined,
    publishUrl: publishUrl ? template(publishUrl)(env) : undefined,
    devDependencies,
  };
}
