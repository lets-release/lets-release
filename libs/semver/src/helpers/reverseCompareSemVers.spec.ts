import { comparisons } from "src/__fixtures__/comparisons";
import { reverseCompareSemVers } from "src/helpers/reverseCompareSemVers";

describe("reverseCompareSemVers", () => {
  it("should return 1 if a < b", () => {
    for (const { min, max } of comparisons) {
      expect(reverseCompareSemVers(min, max)).toBe(1);
    }
  });

  it("should return -1 if a > b", () => {
    for (const { min, max } of comparisons) {
      expect(reverseCompareSemVers(max, min)).toBe(-1);
    }
  });

  it("should return 0 if a === b", () => {
    for (const { min, max } of comparisons) {
      expect(reverseCompareSemVers(min, min)).toBe(0);
      expect(reverseCompareSemVers(max, max)).toBe(0);
    }
  });
});
