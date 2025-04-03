import { isNil } from "lodash-es";

import { parseCalVerFormat } from "src/helpers/parseCalVerFormat";
import { CalVerPrereleaseOptions } from "src/schemas/CalVerPrereleaseOptions";
import { CalVerTokenValues } from "src/types/CalVerTokenValues";
import { ParsedCalVer } from "src/types/ParsedCalVer";

export function formatCalVer(
  format: string,
  {
    tokenValues,
    prereleaseName,
    prereleaseNumber,
    prereleaseOptions,
    build,
  }: Omit<ParsedCalVer, "tokens">,
  options: CalVerPrereleaseOptions = {}, // not forced
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
    }, format);

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

    return `${main}${prefix}${prerelease}${buildMetadata}`;
  } else if (isNil(prereleaseNumber)) {
    return `${main}${buildMetadata}`;
  } else {
    return `${main}-${prereleaseNumber}${buildMetadata}`;
  }
}
