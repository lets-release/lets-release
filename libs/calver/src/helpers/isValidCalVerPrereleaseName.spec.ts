import { identifiers, invalidIdentifiers } from "src/__fixtures__/identifiers";
import { isValidCalVerPrereleaseName } from "src/helpers/isValidCalVerPrereleaseName";

describe("isValidCalVerPrereleaseName", () => {
  it("should return true for valid prerelease name", () => {
    for (const value of identifiers) {
      expect(isValidCalVerPrereleaseName(value)).toBe(true);
    }
  });

  it("should return false for invalid prerelease name", () => {
    for (const value of invalidIdentifiers) {
      expect(isValidCalVerPrereleaseName(value)).toBe(false);
    }
  });
});
