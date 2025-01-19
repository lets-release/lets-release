import { isNil } from "lodash-es";

import { formatSemVer } from "src/helpers/formatSemVer";
import { parseSemVer } from "src/helpers/parseSemVer";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";

/**
 * Increase a semantic version.
 *
 * @param type Increase type
 * @param version Current version
 * @param options Options
 */
export function increaseSemVer(
  type: "major" | "minor" | "patch",
  version: string,
  options?: SemVerPrereleaseOptions & { build?: string },
): string;
export function increaseSemVer(
  type: "build",
  version: string,
  options: SemVerPrereleaseOptions & { build: string },
): string;
export function increaseSemVer(
  type:
    | "major-prerelease"
    | "minor-prerelease"
    | "patch-prerelease"
    | "prerelease",
  version: string,
  options?: SemVerPrereleaseOptions & {
    prereleaseName?: string;
    build?: string;
  },
): string;
export function increaseSemVer(
  type:
    | "major"
    | "minor"
    | "patch"
    | "build"
    | "major-prerelease"
    | "minor-prerelease"
    | "patch-prerelease"
    | "prerelease",
  version: string,
  {
    prereleaseName,
    build,
    ...options
  }: SemVerPrereleaseOptions & { prereleaseName?: string; build?: string } = {},
): string {
  const semver = parseSemVer(version, options);
  const isPrerelease =
    !!semver.prereleaseName || !isNil(semver.prereleaseNumber);

  if (type.includes("major")) {
    // For major-prerelease type: always increment major.
    // For major type:
    // If this is a pre-major version, bump up to the same major version.
    // Otherwise increment major.
    // 1.0.0-5 bumps to 1.0.0
    // 1.1.0 bumps to 2.0.0
    if (
      type.includes("prerelease") ||
      semver.minor !== 0 ||
      semver.patch !== 0 ||
      !isPrerelease
    ) {
      semver.major += 1;
    }

    semver.minor = 0;
    semver.patch = 0;

    semver.prereleaseName = undefined;
    semver.prereleaseNumber = undefined;
  } else if (type.includes("minor")) {
    // For minor-prerelease type: always increment minor.
    // For minor type:
    // If this is a pre-minor version, bump up to the same minor version.
    // Otherwise increment minor.
    // 1.2.0-5 bumps to 1.2.0
    // 1.2.1 bumps to 1.3.0
    if (type.includes("prerelease") || semver.patch !== 0 || !isPrerelease) {
      semver.minor += 1;
    }

    semver.patch = 0;

    semver.prereleaseName = undefined;
    semver.prereleaseNumber = undefined;
  } else if (type.includes("patch")) {
    // For patch-prerelease type: always increment patch.
    // For patch type:
    // If this is not a pre-release version, it will increment the patch.
    // If it is a pre-release it will bump up to the same patch version.
    // 1.2.0-5 patches to 1.2.0
    // 1.2.0 patches to 1.2.1
    if (type === "patch-prerelease" || !isPrerelease) {
      semver.patch += 1;
    }

    semver.prereleaseName = undefined;
    semver.prereleaseNumber = undefined;
  }

  // For prerelease type:
  // If this is a non-prerelease version, acts the same as
  // patch-prerelease.
  if (type === "prerelease" && !isPrerelease) {
    semver.patch += 1;
  }

  if (type.includes("prerelease")) {
    const initialNumber =
      options?.initialNumber ?? semver.prereleaseOptions.initialNumber;

    if (
      (isNil(prereleaseName) || prereleaseName === semver.prereleaseName) &&
      !!semver.prereleaseName &&
      isNil(semver.prereleaseNumber)
    ) {
      options.ignoreZeroNumber = false;
    }

    semver.prereleaseNumber =
      isNil(prereleaseName) || prereleaseName === semver.prereleaseName
        ? isNil(semver.prereleaseNumber)
          ? initialNumber
          : semver.prereleaseNumber + 1
        : initialNumber;
    semver.prereleaseName = prereleaseName ?? semver.prereleaseName;
  }

  if (type === "build" && semver.build === build) {
    throw new TypeError(`Same build metadata: ${build}`);
  }

  semver.build = build;

  return formatSemVer(semver, options);
}
