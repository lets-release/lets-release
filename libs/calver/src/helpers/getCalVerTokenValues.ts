import { TZDateMini } from "@date-fns/tz";
import { formatDate } from "date-fns";

import { CalVerToken } from "src/enums/CalVerToken";
import { parseCalVerFormat } from "src/helpers/parseCalVerFormat";
import { CalVerTokenValues } from "src/types/CalVerTokenValues";

export function getCalVerTokenValues(
  format: string,
  date: string = formatDate(TZDateMini.tz("Etc/UTC"), "yyyy-MM-dd"),
): CalVerTokenValues {
  const { tokens } = parseCalVerFormat(format);
  const dateInTZ = new TZDateMini(date, "Etc/UTC");

  return {
    year:
      (tokens.week
        ? Number(formatDate(dateInTZ, "R"))
        : Number(formatDate(dateInTZ, "y"))) -
      (tokens.year === CalVerToken.YYYY ? 0 : 2000),
    week: Number(formatDate(dateInTZ, "I")),
    month: Number(formatDate(dateInTZ, "M")),
    day: Number(formatDate(dateInTZ, "d")),
    minor: 0,
    micro: 0,
  };
}
