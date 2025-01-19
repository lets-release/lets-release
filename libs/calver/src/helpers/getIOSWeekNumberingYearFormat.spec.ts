import { CalVerToken } from "src/enums/CalVerToken";
import { getIOSWeekNumberingYearFormat } from "src/helpers/getIOSWeekNumberingYearFormat";

describe("getIOSWeekNumberingYearFormat", () => {
  it("should return the correct format", () => {
    expect(getIOSWeekNumberingYearFormat(CalVerToken.YYYY)).toBe("R");
    expect(getIOSWeekNumberingYearFormat(CalVerToken.YY)).toBe("RR");
    expect(getIOSWeekNumberingYearFormat(CalVerToken.Y)).toBe("RR");
  });
});
