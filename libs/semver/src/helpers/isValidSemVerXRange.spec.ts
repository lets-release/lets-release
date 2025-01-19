import { xRanges } from "src/__fixtures__/xRanges";
import { isValidSemVerXRange } from "src/helpers/isValidSemVerXRange";

describe("isValidSemVerXRange", () => {
  it("should validate semver x range", () => {
    for (const { range, parsed } of xRanges) {
      expect(isValidSemVerXRange(range), range).toBe(!!parsed);
    }
  });
});
