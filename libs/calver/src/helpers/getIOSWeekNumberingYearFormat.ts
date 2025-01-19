import { CalVerToken } from "src/enums/CalVerToken";

export function getIOSWeekNumberingYearFormat(
  token: CalVerToken.YYYY | CalVerToken.YY | CalVerToken.Y,
) {
  return {
    [CalVerToken.YYYY]: "R",
    [CalVerToken.YY]: "RR",
    [CalVerToken.Y]: "RR",
  }[token];
}
