import { isNil } from "lodash-es";

import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";
import { ParsedSemVer } from "src/types/ParsedSemVer";

export function formatSemVer(
  {
    major,
    minor,
    patch,
    prereleaseName,
    prereleaseNumber,
    prereleaseOptions,
    build,
  }: ParsedSemVer,
  options: SemVerPrereleaseOptions = {}, // not forced
) {
  const buildMetadata = build ? `+${build}` : "";

  if (prereleaseName) {
    const mergeOptions = {
      ...prereleaseOptions,
      ...options,
    };
    const prefix =
      mergeOptions.prefix === "" && /^\d/.test(prereleaseName)
        ? "-"
        : mergeOptions.prefix;
    const suffix =
      mergeOptions.suffix === "" && /\d$/.test(prereleaseName)
        ? "."
        : mergeOptions.suffix;
    const number = isNil(prereleaseNumber)
      ? mergeOptions.initialNumber
      : prereleaseNumber;
    const prerelease = `${prereleaseName}${number === 0 && mergeOptions.ignoreZeroNumber ? "" : `${suffix}${number}`}`;

    return `${major}.${minor}.${patch}${prefix}${prerelease}${buildMetadata}`;
  } else if (isNil(prereleaseNumber)) {
    return `${major}.${minor}.${patch}${buildMetadata}`;
  } else {
    return `${major}.${minor}.${patch}-${prereleaseNumber}${buildMetadata}`;
  }
}
