import { isNil } from "lodash-es";

import {
  DEFAULT_VERSIONING_PRERELEASE_OPTIONS,
  VersioningPrereleaseOptions,
} from "@lets-release/versioning";

import { formatSemVer } from "src/helpers/formatSemVer";
import { parseSemVer } from "src/helpers/parseSemVer";

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
  options?: VersioningPrereleaseOptions & { build?: string },
): string;
export function increaseSemVer(
  type: "build",
  version: string,
  options: VersioningPrereleaseOptions & { build: string },
): string;
export function increaseSemVer(
  type:
    | "major-prerelease"
    | "minor-prerelease"
    | "patch-prerelease"
    | "prerelease",
  version: string,
  options?: VersioningPrereleaseOptions & {
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
    initialNumber = DEFAULT_VERSIONING_PRERELEASE_OPTIONS.initialNumber,
    ignoreZeroNumber = DEFAULT_VERSIONING_PRERELEASE_OPTIONS.ignoreZeroNumber,
    prereleaseName,
    build,
  }: VersioningPrereleaseOptions & {
    prereleaseName?: string;
    build?: string;
  } = {},
): string {
  const semver = parseSemVer(version);
  const isPrerelease =
    !!semver.prereleaseName || !isNil(semver.prereleaseNumber);

  if (
    type.includes("major") ||
    type.includes("minor") ||
    type.includes("patch")
  ) {
    // clear prerelease info
    semver.prereleaseName = undefined;
    semver.prereleaseNumber = undefined;
  }

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
  }

  if (type.includes("minor")) {
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
  }

  if (
    type.includes("patch") &&
    (type === "patch-prerelease" || !isPrerelease)
  ) {
    // For patch-prerelease type: always increment patch.
    // For patch type:
    // If this is not a pre-release version, it will increment the patch.
    // If it is a pre-release it will bump up to the same patch version.
    // 1.2.0-5 patches to 1.2.0
    // 1.2.0 patches to 1.2.1
    semver.patch += 1;
  }

  // For prerelease type:
  // If this is a non-prerelease version, acts the same as
  // patch-prerelease.
  if (type === "prerelease" && !isPrerelease) {
    semver.patch += 1;
  }

  const prereleaseOptions = { initialNumber, ignoreZeroNumber };

  if (type.includes("prerelease")) {
    const isSamePrereleaseName =
      (prereleaseName ?? "") === (semver.prereleaseName ?? "") ||
      (type === "prerelease" && isNil(prereleaseName));

    if (
      !prereleaseName || // 1.0.0-0
      /^\d+$/.test(prereleaseName) || // 1.0.0-5.0
      (isSamePrereleaseName && isNil(semver.prereleaseNumber)) // 1.0.0-alpha bumps to 1.0.0-alpha.0
    ) {
      prereleaseOptions.ignoreZeroNumber = false;
    }

    semver.prereleaseName = prereleaseName ?? semver.prereleaseName;
    // prereleaseName in options can be omitted when increasing prerelease
    // e.g., increaseSemVer("prerelease", "1.0.0-alpha.5") bumps 1.0.0-alpha.5 to 1.0.0-alpha.6
    semver.prereleaseNumber =
      isSamePrereleaseName && !isNil(semver.prereleaseNumber)
        ? semver.prereleaseNumber + 1
        : initialNumber;
  }

  if (type === "build" && semver.build === build) {
    throw new TypeError(
      `Can not increase version: ${version}, same build metadata: ${build}`,
    );
  }

  semver.build = build;

  return formatSemVer(semver, prereleaseOptions);
}
