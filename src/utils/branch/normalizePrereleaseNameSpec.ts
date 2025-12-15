import { isBoolean, isString } from "lodash-es";

import {
  NormalizedPrereleaseNameSpec,
  PrereleaseNameSpec,
} from "@lets-release/versioning";

import { normalizePrereleaseName } from "src/utils/branch/normalizePrereleaseName";

export function normalizePrereleaseNameSpec(
  name: string,
  spec: PrereleaseNameSpec,
): Partial<NormalizedPrereleaseNameSpec> {
  const defaultName = normalizePrereleaseName(name, undefined);
  const normalized: Partial<NormalizedPrereleaseNameSpec> = {};

  if (isString(spec)) {
    normalized.default = normalizePrereleaseName(name, spec);
  } else if (!isBoolean(spec)) {
    for (const [key, value] of Object.entries(spec)) {
      if (isString(value)) {
        normalized[key] = normalizePrereleaseName(name, value);
      } else if (isBoolean(value)) {
        normalized[key] = defaultName;
      }
    }
  }

  normalized.default = normalized.default ?? defaultName;

  return normalized;
}
