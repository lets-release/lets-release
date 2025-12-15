import { isNil } from "lodash-es";

import {
  DEFAULT_VERSIONING_PRERELEASE_OPTIONS,
  VersioningPrereleaseOptions,
} from "@lets-release/versioning";

import { ParsedSemVer } from "src/types/ParsedSemVer";

export function formatSemVer(
  {
    major,
    minor,
    patch,
    prereleaseName,
    prereleaseNumber,
    build,
  }: ParsedSemVer,
  options: VersioningPrereleaseOptions = DEFAULT_VERSIONING_PRERELEASE_OPTIONS,
) {
  const buildMetadata = build ? `+${build}` : "";

  if (prereleaseName) {
    const number = isNil(prereleaseNumber)
      ? options.initialNumber
      : prereleaseNumber;
    const prerelease = `${prereleaseName}${number === 0 && options.ignoreZeroNumber ? "" : `.${number}`}`;

    return `${major}.${minor}.${patch}-${prerelease}${buildMetadata}`;
  } else if (isNil(prereleaseNumber)) {
    return `${major}.${minor}.${patch}${buildMetadata}`;
  } else {
    return `${major}.${minor}.${patch}-${prereleaseNumber}${buildMetadata}`;
  }
}
