import { NormalizedPackageOptions } from "src/schemas/PackageOptions";
import { BaseContext } from "src/types/BaseContext";

/**
 * Context used for the find packages step.
 */
export interface FindPackagesContext extends BaseContext {
  /**
   * Package options.
   */
  packageOptions: NormalizedPackageOptions;

  /**
   * Plugin context getter.
   */
  getPluginContext: <T>() => T | undefined;

  /**
   * Plugin context setter.
   */
  setPluginContext: <T>(pluginContext: T) => void;
}
