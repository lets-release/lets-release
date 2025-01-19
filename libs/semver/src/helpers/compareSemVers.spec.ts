import { comparisons } from "src/__fixtures__/comparisons";
import { compareSemVers } from "src/helpers/compareSemVers";

describe("compareSemVers", () => {
  it("should return -1 if a < b", () => {
    for (const { min, max } of comparisons) {
      expect(compareSemVers(min, max)).toBe(-1);
    }
  });

  it("should return 1 if a > b", () => {
    for (const { min, max } of comparisons) {
      expect(compareSemVers(max, min)).toBe(1);
    }
  });

  it("should return 0 if a === b", () => {
    for (const { min, max } of comparisons) {
      expect(compareSemVers(min, min)).toBe(0);
      expect(compareSemVers(max, max)).toBe(0);
    }
  });
});
