import { Artifact } from "src/types/Artifact";

/**
 * The version tag.
 */
export interface VersionTag {
  /**
   * The package name.
   */
  package: string;

  /**
   * The tag name.
   */
  tag: string;

  /**
   * The version.
   */
  version: string;

  /**
   * The artifacts.
   */
  artifacts: Artifact[];
}
