import { builds } from "src/__fixtures__/builds";
import { isValidSemVerBuildMetadata } from "src/helpers/isValidSemVerBuildMetadata";

describe("isValidSemVerBuildMetadata", () => {
  it("should validate semver build metadata", () => {
    for (const { value, isValid } of builds) {
      expect(isValidSemVerBuildMetadata(value), value).toBe(isValid ?? false);
    }
  });
});
