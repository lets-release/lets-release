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

  /**
   * Plugin package context getter.
   */
  getPluginPackageContext: <T>(
    packageType: string,
    packageName: string,
  ) => T | undefined;

  /**
   * Plugin package context setter.
   */
  setPluginPackageContext: <T>(
    packageType: string,
    packageName: string,
    pluginPackageContext: T,
  ) => void;
}
