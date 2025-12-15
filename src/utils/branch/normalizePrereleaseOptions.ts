import { isNil } from "lodash-es";

import {
  NormalizedPrereleaseOptions,
  PrereleaseOptions,
} from "@lets-release/config";
import { NormalizedPrereleaseNameSpec } from "@lets-release/versioning";

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

  const normalized = normalizePrereleaseNameSpec(name, options.name);

  if (normalized.default) {
    return {
      ...options,
      name: normalized as NormalizedPrereleaseNameSpec,
      channels,
    };
  }

  return undefined;
}
