import { isNil } from "lodash-es";

import {
  NormalizedPrereleaseOptions,
  PrereleaseOptions,
  VersioningScheme,
} from "@lets-release/config";
import { NormalizedSemVerPrereleaseNameSpec } from "@lets-release/semver";

import { normalizeChannels } from "src/utils/branch/normalizeChannels";
import { normalizePrereleaseName } from "src/utils/branch/normalizePrereleaseName";
import { normalizePrereleaseNameSpec } from "src/utils/branch/normalizePrereleaseNameSpec";

export function normalizePrereleaseOptions(
  name: string,
  options?: PrereleaseOptions,
): NormalizedPrereleaseOptions | undefined {
  const channels = normalizeChannels(name, [name], options?.channels);

  if (isNil(options)) {
    const defaultName = normalizePrereleaseName(name);

    return defaultName
      ? {
          name: { default: defaultName },
          channels,
        }
      : undefined;
  }

  if ("name" in options) {
    const normalized = normalizePrereleaseNameSpec(
      name,
      VersioningScheme.SemVer,
      options.name,
    );

    if (normalized.default) {
      return {
        ...options,
        name: normalized as NormalizedSemVerPrereleaseNameSpec,
        channels,
      };
    }

    return undefined;
  }

  const normalized = Object.fromEntries(
    Object.entries(options.names).map(([key, value]) => {
      const scheme = key as VersioningScheme;
      const normalized = normalizePrereleaseNameSpec(name, scheme, value);

      if (normalized.default) {
        return [scheme, normalized];
      }

      return [scheme, undefined];
    }),
  );

  if (normalized.SemVer && normalized.CalVer) {
    return {
      ...options,
      names: normalized,
      channels,
    } as NormalizedPrereleaseOptions;
  }

  return undefined;
}
