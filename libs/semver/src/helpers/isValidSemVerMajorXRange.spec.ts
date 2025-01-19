import { xRanges } from "src/__fixtures__/xRanges";
import { isValidSemVerMajorXRange } from "src/helpers/isValidSemVerMajorXRange";

describe("isValidSemVerMajorXRange", () => {
  it("should validate semver major x range", () => {
    for (const { range, isMajor } of xRanges) {
      expect(isValidSemVerMajorXRange(range), range).toBe(!!isMajor);
    }
  });
});
