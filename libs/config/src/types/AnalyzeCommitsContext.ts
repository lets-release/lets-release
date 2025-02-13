import { Commit } from "src/types/Commit";
import { HistoricalRelease } from "src/types/HistoricalRelease";
import { Package } from "src/types/Package";
import { VerifyConditionsContext } from "src/types/VerifyConditionsContext";

/**
 * Context used for the analyze commits step.
 */
export interface AnalyzeCommitsContext extends VerifyConditionsContext {
  /**
   * Current package.
   */
  package: Package;

  /**
   * List of commits taken into account when determining the new version.
   */
  commits: Commit[];

  /**
   * Last release.
   */
  lastRelease?: HistoricalRelease;

  /**
   * Plugin package context getter.
   */
  getPluginPackageContext: <T>() => T | undefined;

  /**
   * Plugin package context setter.
   */
  setPluginPackageContext: <T>(pluginPackageContext: T) => void;
}
