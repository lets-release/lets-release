import { isEqual, isNil, pick, pickBy } from "lodash-es";

import {
  DEFAULT_VERSIONING_PRERELEASE_OPTIONS,
  VersioningPrereleaseOptions,
} from "@lets-release/versioning";

import { SEPARATOR } from "src/constants/SEPARATOR";
import { CalVerToken } from "src/enums/CalVerToken";
import { compareCalVers } from "src/helpers/compareCalVers";
import { formatCalVer } from "src/helpers/formatCalVer";
import { getCalVerTokenValues } from "src/helpers/getCalVerTokenValues";
import { parseCalVer } from "src/helpers/parseCalVer";

/**
 * Increase a calendar version.
 *
 * @param type Increase type
 * @param format Version format
 * @param version Current version
 * @param options Options
 */
export function increaseCalVer(
  type:
    | "major"
    | "minor"
    | "patch"
    | "major:maintenance"
    | "minor:maintenance"
    | "patch:maintenance",
  format: string,
  version: string,
  options?: VersioningPrereleaseOptions & { build?: string },
): string;
export function increaseCalVer(
  type: "build",
  format: string,
  version: string,
  options: VersioningPrereleaseOptions & { build: string },
): string;
export function increaseCalVer(
  type:
    | "major-prerelease"
    | "minor-prerelease"
    | "patch-prerelease"
    | "prerelease"
    | "major-prerelease:maintenance"
    | "minor-prerelease:maintenance"
    | "patch-prerelease:maintenance"
    | "prerelease:maintenance",
  format: string,
  version: string,
  options?: VersioningPrereleaseOptions & {
    prereleaseName?: string;
    build?: string;
  },
): string;
export function increaseCalVer(
  type:
    | "major"
    | "minor"
    | "patch"
    | "major:maintenance"
    | "minor:maintenance"
    | "patch:maintenance"
    | "build"
    | "major-prerelease"
    | "minor-prerelease"
    | "patch-prerelease"
    | "prerelease"
    | "major-prerelease:maintenance"
    | "minor-prerelease:maintenance"
    | "patch-prerelease:maintenance"
    | "prerelease:maintenance",
  format: string,
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
  const calver = parseCalVer(format, version);
  const isPrerelease =
    !!calver.prereleaseName || !isNil(calver.prereleaseNumber);

  if (type.includes("maintenance") && !calver.tokens.micro && !isPrerelease) {
    throw new TypeError(
      `Can not increase version: ${version}, no micro token in format: ${format}`,
    );
  }

  const keys = Object.keys(
    pickBy(
      calver.tokens,
      (value) =>
        !isNil(value) &&
        ![CalVerToken.MINOR, CalVerToken.MICRO].includes(value),
    ),
  );
  const tokenValues = getCalVerTokenValues(format);
  const isSameMajorVersion = isEqual(
    pick(calver.tokenValues, keys),
    pick(tokenValues, keys),
  );

  if (
    isSameMajorVersion &&
    type !== "build" &&
    !type.includes("maintenance") &&
    !calver.tokens.micro &&
    !isPrerelease
  ) {
    throw new TypeError(
      `Can not increase version: ${version}, same calendar version`,
    );
  }

  const majorFormat = format
    .trim()
    .toUpperCase()
    .replace(
      new RegExp(
        `(${SEPARATOR}${CalVerToken.MINOR})?${SEPARATOR}${CalVerToken.MICRO}$`,
      ),
      "",
    );

  if (
    compareCalVers(
      majorFormat,
      formatCalVer(majorFormat, { tokenValues: calver.tokenValues }),
      formatCalVer(majorFormat, { tokenValues }),
    ) > 0
  ) {
    throw new TypeError(
      `Can not increase version: ${version}, future version not supported`,
    );
  }

  const shouldUpdateMajorVersion =
    !isSameMajorVersion && type !== "build" && !type.includes("maintenance");

  if (shouldUpdateMajorVersion) {
    calver.tokenValues = {
      ...tokenValues,
      minor: 0,
      micro: 0,
    };

    // clear prerelease info
    calver.prereleaseName = undefined;
    calver.prereleaseNumber = undefined;
  }

  if (!shouldUpdateMajorVersion) {
    if (
      type.includes("major") ||
      type.includes("minor") ||
      type.includes("patch")
    ) {
      calver.prereleaseName = undefined;
      calver.prereleaseNumber = undefined;
    }

    if (
      (type.includes("major") || type.includes("minor")) &&
      calver.tokens.minor
    ) {
      // For minor-prerelease type: always increment minor.
      // For minor type:
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      if (
        type.includes("prerelease") ||
        (calver.tokens.micro && calver.tokenValues.micro !== 0) ||
        !isPrerelease
      ) {
        calver.tokenValues.minor = calver.tokenValues.minor! + 1;
      }

      calver.tokenValues.micro = 0;
    }

    if (
      (((type.includes("major") || type.includes("minor")) &&
        !calver.tokens.minor) ||
        type.includes("patch")) &&
      calver.tokens.micro &&
      (type.includes("-prerelease") || !isPrerelease)
    ) {
      // For patch-prerelease type: always increment micro.
      // For patch type:
      // If this is not a pre-release version, it will increment the micro.
      // If it is a pre-release it will bump up to the same micro version.
      calver.tokenValues.micro = calver.tokenValues.micro! + 1;
    }

    // For prerelease type:
    // If this is a non-prerelease version, acts the same as
    // major-prerelease or patch-prerelease.
    if (type.startsWith("prerelease") && !isPrerelease && calver.tokens.micro) {
      calver.tokenValues.micro = calver.tokenValues.micro! + 1;
    }
  }

  const prereleaseOptions = { initialNumber, ignoreZeroNumber };

  if (type.includes("prerelease")) {
    const isSamePrereleaseName =
      (prereleaseName || "") === (calver.prereleaseName || "") ||
      (type === "prerelease" && isNil(prereleaseName));

    if (
      !prereleaseName || // 1.0.0-0
      /^\d+$/.test(prereleaseName) || // 1.0.0-5.0
      (isSamePrereleaseName && isNil(calver.prereleaseNumber)) // 1.0.0-alpha bumps to 1.0.0-alpha.0
    ) {
      prereleaseOptions.ignoreZeroNumber = false;
    }

    calver.prereleaseName = prereleaseName ?? calver.prereleaseName;
    // prereleaseName in options can be omitted when increasing prerelease
    // e.g., increaseSemVer("prerelease", "1.0.0-alpha.5") bumps 1.0.0-alpha.5 to 1.0.0-alpha.6
    calver.prereleaseNumber =
      isSamePrereleaseName && !isNil(calver.prereleaseNumber)
        ? calver.prereleaseNumber + 1
        : initialNumber;
  }

  if (type === "build" && calver.build === build) {
    throw new TypeError(`Same build metadata: ${build}`);
  }

  calver.build = build;

  return formatCalVer(format, calver, prereleaseOptions);
}
