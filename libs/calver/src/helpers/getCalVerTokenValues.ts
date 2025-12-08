import { formatDate } from "date-fns";

import { CalVerToken } from "src/enums/CalVerToken";
import { parseCalVerFormat } from "src/helpers/parseCalVerFormat";
import { CalVerTokenValues } from "src/types/CalVerTokenValues";

export function getCalVerTokenValues(
  format: string,
  date: Date = new Date(),
): CalVerTokenValues {
  const { tokens } = parseCalVerFormat(format);

  return {
    year:
      (tokens.week
        ? Number(formatDate(date, "R"))
        : Number(formatDate(date, "y"))) -
      (tokens.year === CalVerToken.YYYY ? 0 : 2000),
    week: Number(formatDate(date, "I")),
    month: Number(formatDate(date, "M")),
    day: Number(formatDate(date, "d")),
    minor: 0,
    micro: 0,
  };
}
