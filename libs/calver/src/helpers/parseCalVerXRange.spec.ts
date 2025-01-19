import { xRanges } from "src/__fixtures__/xRanges";
import { parseCalVerXRange } from "src/helpers/parseCalVerXRange";

describe("parseCalVerXRange", () => {
  it("should parse valid calver x range", () => {
    for (const [format, values] of Object.entries(xRanges)) {
      for (const { range, parsed } of values) {
        if (parsed) {
          expect(
            parseCalVerXRange(format, range),
            `${format} ${range}`,
          ).toEqual(parsed);
        }
      }
    }
  });

  it("should throw for invalid calver x range", () => {
    for (const [format, values] of Object.entries(xRanges)) {
      for (const { range, parsed } of values) {
        if (!parsed) {
          expect(
            () => parseCalVerXRange(format, range),
            `${format} ${range}`,
          ).toThrow(TypeError);
        }
      }
    }
  });
});
