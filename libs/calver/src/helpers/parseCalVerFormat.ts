import { escapeRegExp } from "lodash-es";

import { SEPARATOR } from "src/constants/SEPARATOR";
import { CalVerToken } from "src/enums/CalVerToken";
import { CalVerFormatTokens } from "src/types/CalVerFormatTokens";
import { ParsedCalVerFormat } from "src/types/ParsedCalVerFormat";

const year = `(?<year>${CalVerToken.YYYY}|${CalVerToken.YY}|${CalVerToken.Y})`;
const week = `${SEPARATOR}?(?<week>${CalVerToken.WW}|(?<=${SEPARATOR})${CalVerToken.W})`;
const month = `${SEPARATOR}?(?<month>${CalVerToken.MM}|(?<=${SEPARATOR})${CalVerToken.M})`;
const day = `${SEPARATOR}?(?<day>(?<=(${SEPARATOR}|${CalVerToken.MM}))${CalVerToken.DD}|(?<=${SEPARATOR})${CalVerToken.D})`;
const major = `${year}(${week}|${month}(${day})?)?`;
const minor = `${SEPARATOR}(?<minor>${CalVerToken.MINOR})`;
const micro = `${SEPARATOR}(?<micro>${CalVerToken.MICRO})`;
const formatRegex = `^${major}((${minor})?${micro})?$`;
const tokenRegexes = {
  [CalVerToken.YYYY]: String.raw`[1-9]\d{3,}`,
  [CalVerToken.YY]: String.raw`\d{2,}`,
  [CalVerToken.Y]: String.raw`0<?!\d>|[1-9]\d*`,
  [CalVerToken.WW]: String.raw`\d{2}`,
  [CalVerToken.W]: String.raw`[1-9]\d?`,
  [CalVerToken.MM]: String.raw`\d{2}`,
  [CalVerToken.M]: String.raw`[1-9]\d?`,
  [CalVerToken.DD]: String.raw`\d{2}`,
  [CalVerToken.D]: String.raw`[1-9]\d?`,
  [CalVerToken.MINOR]: String.raw`\d+`,
  [CalVerToken.MICRO]: String.raw`\d+`,
};

export function parseCalVerFormat(format: string): ParsedCalVerFormat {
  const trimmed = format.trim().toUpperCase();
  const match = trimmed.match(formatRegex);

  if (!match) {
    throw new TypeError(`Invalid format: ${format}`);
  }

  const tokens = match.groups as unknown as CalVerFormatTokens;
  const regex = (Object.entries(tokens) as [string, CalVerToken?][]).reduce(
    (regex, [key, token]) => {
      if (!token) {
        return regex;
      }

      return regex.replace(
        token,
        `(?<${key}>${tokenRegexes[token]}${key === "year" && new RegExp(`^${token}(?=[0-9a-z])`, "i").test(trimmed) ? "?" : ""})`,
      );
    },
    escapeRegExp(trimmed),
  );

  return {
    tokens,
    regex,
  };
}
