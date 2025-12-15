import { SEPARATOR } from "src/constants/SEPARATOR";
import { CalVerToken } from "src/enums/CalVerToken";
import { formatCalVer } from "src/helpers/formatCalVer";
import { getNextCalVerMajorVersion } from "src/helpers/getNextCalVerMajorVersion";
import { isValidCalVerXRange } from "src/helpers/isValidCalVerXRange";
import { parseCalVer } from "src/helpers/parseCalVer";
import { ParsedCalVerXRange } from "src/types/ParsedCalVerXRange";

export function parseCalVerXRange(
  format: string,
  range: string,
): ParsedCalVerXRange {
  if (!isValidCalVerXRange(format, range)) {
    throw new TypeError(`Invalid CalVer X range ${range} of format ${format}`);
  }

  const trimmedFormat = format.trim().toUpperCase();
  const trimmedRange = range.trim().toLowerCase();
  const hasMinorToken = new RegExp(
    `${SEPARATOR}${CalVerToken.MINOR}${SEPARATOR}${CalVerToken.MICRO}$`,
  ).test(trimmedFormat);
  const separatorRegExp = new RegExp(SEPARATOR);
  const tokens = trimmedFormat.split(separatorRegExp);
  const values = trimmedRange.split(separatorRegExp);
  const isFullRange = tokens.length === values.length;
  const majorFormat = trimmedFormat.replace(
    new RegExp(
      `(${SEPARATOR}${CalVerToken.MINOR})?${SEPARATOR}${CalVerToken.MICRO}$`,
    ),
    "",
  );
  const major =
    !hasMinorToken || !isFullRange
      ? trimmedRange.replace(new RegExp(`${SEPARATOR}x$`), "")
      : trimmedRange.replace(
          new RegExp(
            String.raw`((${SEPARATOR}x){2}|${SEPARATOR}\d+${SEPARATOR}x)$`,
          ),
          "",
        );
  const nextMajor = getNextCalVerMajorVersion(majorFormat, major);
  const { tokenValues: majorTokenValues } = parseCalVer(majorFormat, major);
  const { tokenValues: nextMajorTokenValues } = parseCalVer(
    majorFormat,
    nextMajor,
  );

  if (hasMinorToken) {
    if (isFullRange) {
      const parts = values.slice(-2);
      const minor = /^x$/i.test(parts[0]) ? "*" : Number(parts[0]);

      return {
        major,
        minor,
        micro: "*",
        min: formatCalVer(format, {
          tokenValues: {
            ...majorTokenValues,
            minor: minor === "*" ? 0 : minor,
            micro: 0,
          },
        }),
        max: formatCalVer(format, {
          tokenValues: {
            ...(minor === "*" ? nextMajorTokenValues : majorTokenValues),
            minor: minor === "*" ? 0 : minor + 1,
            micro: 0,
          },
        }),
      };
    }

    return {
      major,
      minor: "*",
      min: formatCalVer(format, {
        tokenValues: {
          ...majorTokenValues,
          minor: 0,
          micro: 0,
        },
      }),
      max: formatCalVer(format, {
        tokenValues: {
          ...nextMajorTokenValues,
          minor: 0,
          micro: 0,
        },
      }),
    };
  }

  return {
    major,
    micro: "*",
    min: formatCalVer(format, {
      tokenValues: {
        ...majorTokenValues,
        micro: 0,
      },
    }),
    max: formatCalVer(format, {
      tokenValues: {
        ...nextMajorTokenValues,
        micro: 0,
      },
    }),
  };
}
