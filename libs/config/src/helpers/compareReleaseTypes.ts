import { RELEASE_TYPES } from "src/constants/RELEASE_TYPES";
import { ReleaseType } from "src/enums/ReleaseType";

/**
 * Test if a release type is of higher level than the current one.
 */
export function compareReleaseTypes(
  releaseType: ReleaseType | null,
  currentReleaseType?: ReleaseType | null,
) {
  return (
    !currentReleaseType ||
    (!!releaseType &&
      RELEASE_TYPES.indexOf(releaseType) <
        RELEASE_TYPES.indexOf(currentReleaseType))
  );
}
