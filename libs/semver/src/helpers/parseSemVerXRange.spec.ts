import { xRanges } from "src/__fixtures__/xRanges";
import { parseSemVerXRange } from "src/helpers/parseSemVerXRange";

describe("parseSemVerXRange", () => {
  it("should parse valid semver x range", () => {
    for (const { range, parsed } of xRanges) {
      if (parsed) {
        expect(parseSemVerXRange(range), range).toEqual(parsed);
      }
    }
  });

  it("should throw error for invalid semver x range", () => {
    for (const { range, parsed } of xRanges) {
      if (!parsed) {
        expect(() => parseSemVerXRange(range), range).toThrow(TypeError);
      }
    }
  });
});
