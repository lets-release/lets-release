import { comparisons } from "src/__fixtures__/comparisons";
import { compareCalVers } from "src/helpers/compareCalVers";

describe("compareCalVers", () => {
  it("should return -1 if the first calver is less than the second", () => {
    for (const [format, { min, max }] of Object.entries(comparisons)) {
      expect(compareCalVers(format, min, max)).toBe(-1);
    }
  });

  it("should return 1 if the first calver is greater than the second", () => {
    for (const [format, { min, max }] of Object.entries(comparisons)) {
      expect(compareCalVers(format, max, min)).toBe(1);
    }
  });

  it("should return 0 if the first calver is equal to the second", () => {
    for (const [format, { min, max }] of Object.entries(comparisons)) {
      expect(compareCalVers(format, min, min)).toBe(0);
      expect(compareCalVers(format, max, max)).toBe(0);
    }
  });
});
