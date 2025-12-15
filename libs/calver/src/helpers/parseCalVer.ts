import { isValid, parse } from "date-fns";
import { isNil } from "lodash-es";

import { REGULAR_EXPRESSIONS } from "@lets-release/versioning";

import { CalVerToken } from "src/enums/CalVerToken";
import { parseCalVerFormat } from "src/helpers/parseCalVerFormat";
import { CalVerTokenValues } from "src/types/CalVerTokenValues";
import { ParsedCalVer } from "src/types/ParsedCalVer";

export function parseCalVer(
  format: string,
  version: string,
  prereleaseName?: string,
): ParsedCalVer {
  const { tokens, regex: VERSION_CORE } = parseCalVerFormat(format);
  const { PRERELEASE, BUILD } = REGULAR_EXPRESSIONS;
  const regex = String.raw`^${VERSION_CORE}${PRERELEASE}?${BUILD}?$`;
  const trimmedVersion = version.trim();
  const match = trimmedVersion.match(regex);

  if (!match?.groups) {
    throw new TypeError(`Invalid CalVer of format ${format}: ${version}`);
  }

  const { prerelease, build, ...rest } = match.groups;
  const tokenValues = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => {
      const number = +value;

      if (number > Number.MAX_SAFE_INTEGER) {
        throw new TypeError(`Invalid ${key}`);
      }

      return [key, number];
    }),
  ) as unknown as CalVerTokenValues;
  const { year, week, month, day } = tokenValues;

  if (
    !isNil(week) &&
    !isValid(
      parse(
        `${tokens.year === CalVerToken.YYYY ? year : year + 2000}-${week}`,
        `R-I`,
        new Date(),
      ),
    )
  ) {
    throw new TypeError("Invalid week");
  }

  if (
    !isNil(month) &&
    !isValid(
      parse(
        `${tokens.year === CalVerToken.YYYY ? year : year + 2000}-${month}-${day ?? 1}`,
        `y-M-d`,
        new Date(),
      ),
    )
  ) {
    throw new TypeError(`Invalid month${day ? ` or day` : ""}`);
  }

  if (!prerelease) {
    return {
      tokens,
      tokenValues,
      build,
    };
  }

  const identifiers = prerelease.split(".");
  const nameIdentifiers = identifiers.slice(0, -1);
  const numberIdentifier = identifiers?.at(-1);

  if (prereleaseName) {
    if (prereleaseName === identifiers.join(".")) {
      return {
        tokens,
        tokenValues,
        prereleaseName,
        build,
      };
    }

    if (
      prereleaseName === nameIdentifiers.join(".") &&
      numberIdentifier &&
      /^\d+$/.test(numberIdentifier)
    ) {
      return {
        tokens,
        tokenValues,
        prereleaseName,
        prereleaseNumber: Number(numberIdentifier),
        build,
      };
    }

    throw new TypeError(
      `Prerelease name not match: "${prereleaseName}" expected`,
    );
  }

  if (numberIdentifier && /^\d+$/.test(numberIdentifier)) {
    return {
      tokens,
      tokenValues,
      prereleaseName:
        nameIdentifiers.length > 0 ? nameIdentifiers.join(".") : undefined,
      prereleaseNumber: Number(numberIdentifier),
      build,
    };
  }

  return {
    tokens,
    tokenValues,
    prereleaseName: identifiers.join("."),
    build,
  };
}
