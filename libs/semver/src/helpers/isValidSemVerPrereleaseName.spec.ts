import { prereleaseNames } from "src/__fixtures__/prereleases";
import { isValidSemVerPrereleaseName } from "src/helpers/isValidSemVerPrereleaseName";

describe("isValidSemVerPrereleaseName", () => {
  it("should validate semver prerelease name", () => {
    for (const { value, isValid } of prereleaseNames) {
      expect(isValidSemVerPrereleaseName(value), value).toBe(isValid ?? false);
    }
  });
});
