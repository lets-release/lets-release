import { template } from "lodash-es";

import {
  BranchType,
  PrereleaseBranch,
  ReleaseBranch,
} from "@lets-release/config";
import { isValidPrereleaseName } from "@lets-release/versioning";

import { getNormalizedPrereleaseName } from "src/utils/branch/getNormalizedPrereleaseName";

export function getPluginPrereleaseName(
  branch: PrereleaseBranch,
  pluginName?: string,
): string | undefined;
export function getPluginPrereleaseName(
  branch: ReleaseBranch,
  prerelease: string,
  pluginName?: string,
): string | undefined;
export function getPluginPrereleaseName(
  branch: PrereleaseBranch | ReleaseBranch,
  prereleaseOrPluginName?: string,
  pluginNameOrUndefined?: string,
): string | undefined {
  if (branch.type === BranchType.prerelease) {
    return getNormalizedPrereleaseName(
      (branch as PrereleaseBranch).prerelease,
      prereleaseOrPluginName,
    );
  }

  if (!prereleaseOrPluginName) {
    return;
  }

  const options = branch.prereleases?.[prereleaseOrPluginName];

  if (options) {
    return getNormalizedPrereleaseName(options, pluginNameOrUndefined);
  }

  const name = template(prereleaseOrPluginName)({ name: branch.name });

  return isValidPrereleaseName(name) ? name : undefined;
}
