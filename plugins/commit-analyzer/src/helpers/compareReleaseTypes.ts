import { RELEASE_TYPES, ReleaseType } from "@lets-release/config";

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
