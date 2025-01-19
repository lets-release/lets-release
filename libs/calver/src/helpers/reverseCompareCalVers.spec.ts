import { comparisons } from "src/__fixtures__/comparisons";
import { reverseCompareCalVers } from "src/helpers/reverseCompareCalVers";

describe("reverseCompareCalVers", () => {
  it("should return 1 if the first calver is less than the second", () => {
    for (const [format, { min, max }] of Object.entries(comparisons)) {
      expect(reverseCompareCalVers(format, min, max)).toBe(1);
    }
  });

  it("should return -1 if the first calver is greater than the second", () => {
    for (const [format, { min, max }] of Object.entries(comparisons)) {
      expect(reverseCompareCalVers(format, max, min)).toBe(-1);
    }
  });

  it("should return 0 if the first calver is equal to the second", () => {
    for (const [format, { min, max }] of Object.entries(comparisons)) {
      expect(reverseCompareCalVers(format, min, min)).toBe(0);
      expect(reverseCompareCalVers(format, max, max)).toBe(0);
    }
  });
});
