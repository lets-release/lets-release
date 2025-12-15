import { template } from "lodash-es";

import { isValidPrereleaseName } from "@lets-release/versioning";

export function normalizePrereleaseName(name: string, spec?: string) {
  const value = spec ? template(spec)({ name }) : name;

  return isValidPrereleaseName(value) ? value : undefined;
}
