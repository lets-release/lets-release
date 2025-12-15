import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  formatDate,
  parse,
} from "date-fns";
import { isNil } from "lodash-es";

import { CalVerToken } from "src/enums/CalVerToken";
import { formatCalVer } from "src/helpers/formatCalVer";
import { getCalVerTokenValues } from "src/helpers/getCalVerTokenValues";
import { parseCalVer } from "src/helpers/parseCalVer";

export function getNextCalVerMajorVersion(
  format: string,
  version: string,
): string {
  const calver = parseCalVer(format, version);
  const {
    tokens,
    tokenValues: { year, week, month, day },
  } = calver;

  let date = new Date();

  if (!isNil(week)) {
    date = addWeeks(
      parse(
        `${tokens.year === CalVerToken.YYYY ? year : year + 2000}-${week}`,
        `R-I`,
        new Date(),
      ),
      1,
    );
  } else if (isNil(month)) {
    date = addYears(
      parse(
        `${tokens.year === CalVerToken.YYYY ? year : year + 2000}`,
        `y`,
        new Date(),
      ),
      1,
    );
  } else {
    date = parse(
      `${tokens.year === CalVerToken.YYYY ? year : year + 2000}-${month}-${day ?? 1}`,
      `y-M-d`,
      new Date(),
    );

    date = isNil(day) ? addMonths(date, 1) : addDays(date, 1);
  }

  calver.tokenValues = {
    ...getCalVerTokenValues(format, formatDate(date, "yyyy-MM-dd")),
    minor: 0,
    micro: 0,
  };

  return formatCalVer(format, calver);
}
