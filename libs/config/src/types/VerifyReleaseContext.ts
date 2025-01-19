import { AnalyzeCommitsContext } from "src/types/AnalyzeCommitsContext";
import { NextRelease } from "src/types/NextRelease";

/**
 * Context used for the verify release step.
 */
export interface VerifyReleaseContext extends AnalyzeCommitsContext {
  /**
   * The next release.
   */
  nextRelease: NextRelease;
}
