import { xRanges } from "src/__fixtures__/xRanges";
import { parseCalVerXRange } from "src/helpers/parseCalVerXRange";

describe("parseCalVerXRange", () => {
  describe.each(Object.entries(xRanges))("format: $0", (format, values) => {
    const validRanges = values.filter((xr) => xr.parsed);
    const invalidRanges = values.filter((xr) => !xr.parsed);

    it.each(validRanges)(
      "should parse valid calver x range: $range",
      ({ range, parsed }) => {
        expect(parseCalVerXRange(format, range), range).toEqual(parsed);
      },
    );

    it.each(invalidRanges)(
      "should throw error for invalid calver x range: $range",
      ({ range }) => {
        expect(() => parseCalVerXRange(format, range), range).toThrow(
          TypeError,
        );
      },
    );
  });
});
