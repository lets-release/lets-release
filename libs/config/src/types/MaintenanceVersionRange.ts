import { VersionRange } from "src/types/VersionRange";

/**
 * Maintenance branch version range.
 */
export interface MaintenanceVersionRange extends Required<VersionRange> {
  /**
   * The minimum version that can be merged.
   */
  mergeMin: string;

  /**
   * The maximum version that can be merged.
   */
  mergeMax: string;
}
