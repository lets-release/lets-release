import { isBoolean, isString } from "lodash-es";

import {
  CalVerPrereleaseNameSpec,
  NormalizedCalVerPrereleaseNameSpec,
} from "@lets-release/calver";
import { VersioningScheme } from "@lets-release/config";
import {
  NormalizedSemVerPrereleaseNameSpec,
  SemVerPrereleaseNameSpec,
} from "@lets-release/semver";

import { normalizePrereleaseName } from "src/utils/branch/normalizePrereleaseName";

export function normalizePrereleaseNameSpec<
  T extends VersioningScheme = VersioningScheme,
>(
  name: string,
  scheme: T,
  spec: {
    [VersioningScheme.SemVer]: SemVerPrereleaseNameSpec;
    [VersioningScheme.CalVer]: CalVerPrereleaseNameSpec;
  }[T],
): {
  [VersioningScheme.SemVer]: Partial<NormalizedSemVerPrereleaseNameSpec>;
  [VersioningScheme.CalVer]: Partial<NormalizedCalVerPrereleaseNameSpec>;
}[T] {
  const defaultName = normalizePrereleaseName(name, undefined, scheme);
  const normalized: {
    [VersioningScheme.SemVer]: Partial<NormalizedSemVerPrereleaseNameSpec>;
    [VersioningScheme.CalVer]: Partial<NormalizedCalVerPrereleaseNameSpec>;
  }[T] = {};

  if (isString(spec)) {
    normalized.default = normalizePrereleaseName(name, spec, scheme);
  } else if (!isBoolean(spec)) {
    for (const [key, value] of Object.entries(spec)) {
      if (isString(value)) {
        normalized[key] = normalizePrereleaseName(name, value, scheme);
      } else if (isBoolean(value)) {
        normalized[key] = defaultName;
      }
    }
  }

  normalized.default = normalized.default ?? defaultName;

  return normalized;
}
