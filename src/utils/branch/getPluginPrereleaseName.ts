import { template } from "lodash-es";

import { isValidCalVerPrereleaseName } from "@lets-release/calver";
import {
  BranchType,
  Package,
  PrereleaseBranch,
  ReleaseBranch,
  VersioningScheme,
} from "@lets-release/config";
import { isValidSemVerPrereleaseName } from "@lets-release/semver";

import { getNormalizedPrereleaseName } from "src/utils/branch/getNormalizedPrereleaseName";

export function getPluginPrereleaseName(
  branch: PrereleaseBranch,
  pkg: Package,
  pluginName?: string,
): string | undefined;
export function getPluginPrereleaseName(
  branch: ReleaseBranch,
  pkg: Package,
  prerelease: string,
  pluginName?: string,
): string | undefined;
export function getPluginPrereleaseName(
  branch: PrereleaseBranch | ReleaseBranch,
  pkg: Package,
  prereleaseOrPluginName?: string,
  pluginNameOrUndefined?: string,
): string | undefined {
  if (branch.type === BranchType.prerelease) {
    return getNormalizedPrereleaseName(
      (branch as PrereleaseBranch).prerelease,
      pkg.versioning.scheme,
      prereleaseOrPluginName,
    );
  }

  if (!prereleaseOrPluginName) {
    return;
  }

  const options = branch.prereleases?.[prereleaseOrPluginName];

  if (options) {
    return getNormalizedPrereleaseName(
      options,
      pkg.versioning.scheme,
      pluginNameOrUndefined,
    );
  }

  const name = template(prereleaseOrPluginName)({ name: branch.name });

  return (
    pkg.versioning.scheme === VersioningScheme.SemVer
      ? isValidSemVerPrereleaseName(name)
      : isValidCalVerPrereleaseName(name)
  )
    ? name
    : undefined;
}
