import { isValid, parse } from "date-fns";
import { escapeRegExp, isNil } from "lodash-es";

import { DEFAULT_CALVER_PRERELEASE_OPTIONS } from "src/constants/DEFAULT_CALVER_PRERELEASE_OPTIONS";
import { REGULAR_EXPRESSIONS } from "src/constants/REGULAR_EXPRESSIONS";
import { getCalendarYearFormat } from "src/helpers/getCalendarYearFormat";
import { getIOSWeekNumberingYearFormat } from "src/helpers/getIOSWeekNumberingYearFormat";
import { parseCalVerFormat } from "src/helpers/parseCalVerFormat";
import {
  CalVerPrereleaseOptions,
  NormalizedCalVerPrereleaseOptions,
} from "src/schemas/CalVerPrereleaseOptions";
import { CalVerTokenValues } from "src/types/CalVerTokenValues";
import { ParsedCalVer } from "src/types/ParsedCalVer";

export function parseCalVer(
  format: string,
  version: string,
  options: CalVerPrereleaseOptions = {}, // not forced
): ParsedCalVer {
  const trimmedFormat = format.trim();
  const trimmedVersion = version.trim();
  const errorMessage = `Invalid CalVer ${trimmedVersion} of format ${trimmedFormat}`;

  const { tokens, regex: mainRegex } = parseCalVerFormat(trimmedFormat);
  const { SEPARATOR, PRERELEASE, BUILD } = REGULAR_EXPRESSIONS;
  const regex = String.raw`^${mainRegex}${SEPARATOR}?(?<prerelease>${PRERELEASE})?(\+(?<build>${BUILD}))?$`;

  const { prerelease, build, ...rest } =
    trimmedVersion.match(regex)?.groups ?? {};

  if (!rest.year) {
    throw new TypeError(`${errorMessage}: invalid year: ${rest.year}`);
  }

  const tokenValues = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => {
      const number = +value;

      if (number > Number.MAX_SAFE_INTEGER) {
        throw new TypeError(`${errorMessage}: invalid ${key}: ${number}`);
      }

      return [key, number];
    }),
  ) as unknown as CalVerTokenValues;
  const { year, week, month, day } = tokenValues;

  if (
    !isNil(week) &&
    !isValid(
      parse(
        `${year}-${week}`,
        `${getIOSWeekNumberingYearFormat(tokens.year)}-I`,
        new Date(),
      ),
    )
  ) {
    throw new TypeError(`${errorMessage}: invalid week: ${year}-${week}`);
  }

  if (
    !isNil(month) &&
    !isValid(
      parse(
        `${year}-${month}-${day ?? 1}`,
        `${getCalendarYearFormat(tokens.year)}-M-d`,
        new Date(),
      ),
    )
  ) {
    throw new TypeError(
      `${errorMessage}: invalid ${day ? "date" : "month"}: ${year}-${month}${day ? `-${day}` : ""}`,
    );
  }

  const prereleaseOptions = {
    ...DEFAULT_CALVER_PRERELEASE_OPTIONS,
    ...options,
  };

  if (!prerelease) {
    return {
      tokens,
      tokenValues,
      prereleaseOptions,
      build,
    };
  }

  const [prefix] =
    trimmedVersion
      .match(
        `(${SEPARATOR})${escapeRegExp(`${prerelease}${build ? `+${build}` : ""}`)}$`,
      )
      ?.slice(1) ?? [];

  if (prefix) {
    prereleaseOptions.prefix =
      prefix as NormalizedCalVerPrereleaseOptions["prefix"];
  } else if (prereleaseOptions.prefix !== "") {
    prereleaseOptions.prefix = "";
  }

  const identifiers = (
    prefix && options?.prefix === "" ? `${prefix}${prerelease}` : prerelease
  )
    .split(".")
    .filter((id) => id !== "");
  const lastIdentifier = identifiers?.at(-1)?.toString();

  let prereleaseName: string | undefined = undefined;
  let prereleaseIdentifiers: string[] | undefined = undefined;
  let prereleaseNumber: number | undefined = undefined;

  // 1.0.0-0
  // 1.0.0-0.0
  // 1.0.0-alpha
  // 1.0.0-alpha.0
  // 1.0.0-alpha.0.0
  // 1.0.0-alpha0
  // 1.0.0-alpha0.0
  // 1.0.0alpha
  // 1.0.0alpha.0
  // 1.0.0alpha.0.0
  // 1.0.0alpha0
  // 1.0.0alpha0.0
  if (lastIdentifier && /^\d+$/.test(lastIdentifier)) {
    prereleaseIdentifiers = identifiers.slice(0, -1);
    prereleaseNumber = Number(lastIdentifier);
    prereleaseOptions.suffix = ".";
  } else {
    const [id, num] =
      lastIdentifier?.match(/^(.*)?((?<=\D)\d+)$/)?.slice(1) ?? [];

    if (options?.suffix === "." || !id || !num) {
      prereleaseIdentifiers = identifiers;
    } else {
      prereleaseIdentifiers = [...identifiers.slice(0, -1), id];
      prereleaseNumber = Number(num);
      prereleaseOptions.suffix = "";
    }
  }

  prereleaseName = prereleaseIdentifiers?.join(".");

  if (!isNil(prereleaseNumber)) {
    const id = prereleaseIdentifiers.at(-1);

    prereleaseOptions.initialNumber = prereleaseNumber > 0 ? 1 : 0;
    prereleaseOptions.ignoreZeroNumber =
      prereleaseNumber !== 0 && !!id && !/^\d+$/.test(id);
  }

  return {
    tokens,
    tokenValues,
    prereleaseName,
    prereleaseNumber,
    prereleaseOptions,
    build,
  };
}
