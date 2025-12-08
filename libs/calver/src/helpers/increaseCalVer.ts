import { add, formatDate, parse } from "date-fns";
import { cloneDeep, isEqual, isNil, pick, pickBy } from "lodash-es";

import { CalVerToken } from "src/enums/CalVerToken";
import { formatCalVer } from "src/helpers/formatCalVer";
import { parseCalVer } from "src/helpers/parseCalVer";
import { CalVerPrereleaseOptions } from "src/schemas/CalVerPrereleaseOptions";

/**
 * Increase a calendar version.
 *
 * @param type Increase type
 * @param version Current version
 * @param options Options
 */
export function increaseCalVer(
  type: "major" | "minor" | "micro",
  format: string,
  version: string,
  options?: CalVerPrereleaseOptions & {
    build?: string;
    majorIncrement?: number;
  },
): string;
export function increaseCalVer(
  type: "build",
  format: string,
  version: string,
  options: CalVerPrereleaseOptions & { build: string; majorIncrement?: number },
): string;
export function increaseCalVer(
  type:
    | "major-prerelease"
    | "minor-prerelease"
    | "micro-prerelease"
    | "prerelease",
  format: string,
  version: string,
  options?: CalVerPrereleaseOptions & {
    prereleaseName?: string;
    build?: string;
    majorIncrement?: number;
  },
): string;
export function increaseCalVer(
  type:
    | "major"
    | "minor"
    | "micro"
    | "build"
    | "major-prerelease"
    | "minor-prerelease"
    | "micro-prerelease"
    | "prerelease",
  format: string,
  version: string,
  {
    prereleaseName,
    build,
    majorIncrement,
    ...options
  }: CalVerPrereleaseOptions & {
    prereleaseName?: string;
    build?: string;
    majorIncrement?: number;
  } = {},
): string {
  const calver = parseCalVer(format, version, options);
  const isPrerelease =
    !!calver.prereleaseName || !isNil(calver.prereleaseNumber);

  const increaseMajorVersion = () => {
    const yearFormat = calver.tokens.week ? "R" : "y";
    const weekFormat = "I";
    const monthFormat = "M";
    const dayFormat = "d";
    const monthDayFormat = `${calver.tokens.month ? monthFormat : ""}${calver.tokens.day ? `-${dayFormat}` : ""}`;
    const format = `${yearFormat}${calver.tokens.week ? `-${weekFormat}` : monthDayFormat ? `-${monthDayFormat}` : ""}`;
    const monthDay = `${calver.tokenValues.month ?? ""}${calver.tokenValues.day ? `-${calver.tokenValues.day}` : ""}`;
    const currentYear =
      calver.tokens.year === CalVerToken.YYYY
        ? calver.tokenValues.year
        : calver.tokenValues.year + 2000;
    const currentDate = `${currentYear}${calver.tokens.week ? `-${calver.tokenValues.week}` : monthDay ? `-${monthDay}` : ""}`;

    const date = majorIncrement
      ? add(parse(currentDate, format, new Date()), {
          years: calver.tokens.week || monthDay ? 0 : majorIncrement,
          weeks: calver.tokens.week ? majorIncrement : 0,
          months:
            !calver.tokens.week && calver.tokens.month && !calver.tokens.day
              ? majorIncrement
              : 0,
          days:
            !calver.tokens.week && calver.tokens.month && calver.tokens.day
              ? majorIncrement
              : 0,
        })
      : new Date();

    const tokenValues = cloneDeep(calver.tokenValues);

    calver.tokenValues.year =
      Number(formatDate(date, yearFormat)) -
      (calver.tokens.year === CalVerToken.YYYY ? 0 : 2000);
    calver.tokenValues.week = Number(formatDate(date, "I"));
    calver.tokenValues.month = Number(formatDate(date, "M"));
    calver.tokenValues.day = Number(formatDate(date, "d"));

    const keys = Object.keys(pickBy(calver.tokens, (value) => !isNil(value)));

    if (isEqual(pick(calver.tokenValues, keys), pick(tokenValues, keys))) {
      throw new TypeError(`Same major version: ${version}`);
    }
  };

  if (type.includes("major")) {
    // For major-prerelease type: always increment major.
    // For major type:
    // If this is a pre-major version, bump up to the same major version.
    // Otherwise increment major.
    if (
      type.includes("prerelease") ||
      (calver.tokens.minor && calver.tokenValues.minor !== 0) ||
      (calver.tokens.micro && calver.tokenValues.micro !== 0) ||
      !isPrerelease
    ) {
      increaseMajorVersion();
    }

    calver.tokenValues.minor = 0;
    calver.tokenValues.micro = 0;

    calver.prereleaseName = undefined;
    calver.prereleaseNumber = undefined;
  } else if (type.includes("minor")) {
    if (!calver.tokens.minor) {
      throw new TypeError(`No minor token: ${format}`);
    }

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

    calver.prereleaseName = undefined;
    calver.prereleaseNumber = undefined;
  } else if (type.includes("micro")) {
    if (!calver.tokens.micro) {
      throw new TypeError(`No micro token: ${format}`);
    }

    // For micro-prerelease type: always increment micro.
    // For micro type:
    // If this is not a pre-release version, it will increment the micro.
    // If it is a pre-release it will bump up to the same micro version.
    if (type === "micro-prerelease" || !isPrerelease) {
      calver.tokenValues.micro = calver.tokenValues.micro! + 1;
    }

    calver.prereleaseName = undefined;
    calver.prereleaseNumber = undefined;
  }

  // For prerelease type:
  // If this is a non-prerelease version, acts the same as
  // major-prerelease or micro-prerelease.
  if (type === "prerelease" && !isPrerelease) {
    if (calver.tokens.micro) {
      calver.tokenValues.micro = calver.tokenValues.micro! + 1;
    } else {
      increaseMajorVersion();
    }
  }

  if (type.includes("prerelease")) {
    const initialNumber =
      options?.initialNumber ?? calver.prereleaseOptions.initialNumber;

    if (
      (isNil(prereleaseName) || prereleaseName === calver.prereleaseName) &&
      !!calver.prereleaseName &&
      isNil(calver.prereleaseNumber)
    ) {
      options.ignoreZeroNumber = false;
    }

    calver.prereleaseNumber =
      isNil(prereleaseName) || prereleaseName === calver.prereleaseName
        ? isNil(calver.prereleaseNumber)
          ? initialNumber
          : calver.prereleaseNumber + 1
        : initialNumber;
    calver.prereleaseName = prereleaseName ?? calver.prereleaseName;
  }

  if (type === "build" && calver.build === build) {
    throw new TypeError(`Same build metadata: ${build}`);
  }

  calver.build = build;

  return formatCalVer(format, calver, options);
}
