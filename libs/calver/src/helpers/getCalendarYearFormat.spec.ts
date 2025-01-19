import { CalVerToken } from "src/enums/CalVerToken";
import { getCalendarYearFormat } from "src/helpers/getCalendarYearFormat";

describe("getCalendarYearFormat", () => {
  it("should return the correct format", () => {
    expect(getCalendarYearFormat(CalVerToken.YYYY)).toBe("y");
    expect(getCalendarYearFormat(CalVerToken.YY)).toBe("yy");
    expect(getCalendarYearFormat(CalVerToken.Y)).toBe("yy");
  });
});
