import { NormalizedCalVerOptions } from "@lets-release/calver";
import { NormalizedSemVerOptions } from "@lets-release/semver";

import { PackageInfo } from "src/schemas/PackageInfo";

/**
 * Package details.
 */
export interface Package extends PackageInfo {
  /**
   * Main package or not.
   */
  main?: boolean;

  /**
   * The package versioning options.
   */
  versioning: NormalizedSemVerOptions | NormalizedCalVerOptions;

  /**
   * The unique package name: either `name` or `${type}/${name}`.
   */
  uniqueName: string;

  /**
   * The package name.
   */
  pluginName: string;
}
