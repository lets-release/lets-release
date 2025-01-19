import { template } from "lodash-es";

import { isValidCalVerPrereleaseName } from "@lets-release/calver";
import { VersioningScheme } from "@lets-release/config";
import { isValidSemVerPrereleaseName } from "@lets-release/semver";

export function normalizePrereleaseName(
  name: string,
  spec?: string,
  scheme: VersioningScheme = VersioningScheme.SemVer,
) {
  const value = spec ? template(spec)({ name }) : name;

  return (
    scheme === VersioningScheme.SemVer
      ? isValidSemVerPrereleaseName(value)
      : isValidCalVerPrereleaseName(value)
  )
    ? value
    : undefined;
}
