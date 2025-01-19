import { CalVerToken } from "src/enums/CalVerToken";

export function getCalendarYearFormat(
  token: CalVerToken.YYYY | CalVerToken.YY | CalVerToken.Y,
) {
  return {
    [CalVerToken.YYYY]: "y",
    [CalVerToken.YY]: "yy",
    [CalVerToken.Y]: "yy",
  }[token];
}
