import { DEFAULT_CALVER_PRERELEASE_OPTIONS } from "src/constants/DEFAULT_CALVER_PRERELEASE_OPTIONS";
import { formatCalVer } from "src/helpers/formatCalVer";
import { increaseCalVer } from "src/helpers/increaseCalVer";
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

  const hasMinorToken = /[._-]minor[._-]micro$/i.test(format);
  const tokens = format.split(/[._-]/);
  const values = range.split(/[._-]/);
  const isFullRange = tokens.length === values.length;
  const majorFormat = format.replace(/([._-]minor)?[._-]micro$/i, "");
  const major =
    !hasMinorToken || !isFullRange
      ? range.replace(/[._-]x$/i, "")
      : range.replace(/(([._-]x){2}|[._-]\d+[._-]x)$/i, "");
  const nextMajor = increaseCalVer("major", majorFormat, major, {
    majorIncrement: 1,
  });
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
          prereleaseOptions: DEFAULT_CALVER_PRERELEASE_OPTIONS,
        }),
        max: formatCalVer(format, {
          tokenValues: {
            ...(minor === "*" ? nextMajorTokenValues : majorTokenValues),
            minor: minor === "*" ? 0 : minor + 1,
            micro: 0,
          },
          prereleaseOptions: DEFAULT_CALVER_PRERELEASE_OPTIONS,
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
        prereleaseOptions: DEFAULT_CALVER_PRERELEASE_OPTIONS,
      }),
      max: formatCalVer(format, {
        tokenValues: {
          ...nextMajorTokenValues,
          minor: 0,
          micro: 0,
        },
        prereleaseOptions: DEFAULT_CALVER_PRERELEASE_OPTIONS,
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
      prereleaseOptions: DEFAULT_CALVER_PRERELEASE_OPTIONS,
    }),
    max: formatCalVer(format, {
      tokenValues: {
        ...nextMajorTokenValues,
        micro: 0,
      },
      prereleaseOptions: DEFAULT_CALVER_PRERELEASE_OPTIONS,
    }),
  };
}
