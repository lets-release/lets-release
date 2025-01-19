import { identifiers, invalidIdentifiers } from "src/__fixtures__/identifiers";
import { isValidCalVerBuildMetadata } from "src/helpers/isValidCalVerBuildMetadata";

describe("isValidCalVerBuildMetadata", () => {
  it("should return true for valid build metadata", () => {
    for (const value of identifiers) {
      expect(isValidCalVerBuildMetadata(value)).toBe(true);
    }
  });

  it("should return false for invalid build metadata", () => {
    for (const value of invalidIdentifiers) {
      expect(isValidCalVerBuildMetadata(value)).toBe(false);
    }
  });
});
