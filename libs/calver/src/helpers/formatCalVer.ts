import { isNil } from "lodash-es";

import {
  DEFAULT_VERSIONING_PRERELEASE_OPTIONS,
  VersioningPrereleaseOptions,
} from "@lets-release/versioning";

import { parseCalVerFormat } from "src/helpers/parseCalVerFormat";
import { CalVerTokenValues } from "src/types/CalVerTokenValues";
import { ParsedCalVer } from "src/types/ParsedCalVer";

export function formatCalVer(
  format: string,
  {
    tokenValues,
    prereleaseName,
    prereleaseNumber,
    build,
  }: Omit<ParsedCalVer, "tokens">,
  options: VersioningPrereleaseOptions = DEFAULT_VERSIONING_PRERELEASE_OPTIONS,
) {
  const { tokens } = parseCalVerFormat(format);
  const main = (Object.entries(tokens) as [string, string][])
    .filter(([, token]) => !!token)
    .reduce((version, [key, token]) => {
      const value = tokenValues[key as keyof CalVerTokenValues];

      if (isNil(value)) {
        throw new TypeError(`Missing token value for ${key}`);
      }

      const valueString = String(value);

      return version.replace(
        token,
        token.startsWith("0") ? valueString.padStart(2, "0") : valueString,
      );
    }, format.trim().toUpperCase());

  const buildMetadata = build ? `+${build}` : "";

  if (prereleaseName) {
    const number = isNil(prereleaseNumber)
      ? options.initialNumber
      : prereleaseNumber;
    const prerelease = `${prereleaseName}${number === 0 && options.ignoreZeroNumber ? "" : `.${number}`}`;

    return `${main}-${prerelease}${buildMetadata}`;
  } else if (isNil(prereleaseNumber)) {
    return `${main}${buildMetadata}`;
  } else {
    return `${main}-${prereleaseNumber}${buildMetadata}`;
  }
}
