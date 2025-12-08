import { xRanges } from "src/__fixtures__/xRanges";
import { parseSemVerXRange } from "src/helpers/parseSemVerXRange";

describe("parseSemVerXRange", () => {
  const validRanges = xRanges.filter((xr) => xr.parsed);
  const invalidRanges = xRanges.filter((xr) => !xr.parsed);

  it.each(validRanges)(
    "should parse valid semver x range: $range",
    ({ range, parsed }) => {
      expect(parseSemVerXRange(range), range).toEqual(parsed);
    },
  );

  it.each(invalidRanges)(
    "should throw error for invalid semver x range: $range",
    ({ range }) => {
      expect(() => parseSemVerXRange(range), range).toThrow(TypeError);
    },
  );
});
