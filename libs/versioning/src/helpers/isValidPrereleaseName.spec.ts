import { prereleaseNames } from "src/__fixtures__/prereleases";
import { isValidPrereleaseName } from "src/helpers/isValidPrereleaseName";

describe("isValidPrereleaseName", () => {
  it.each(prereleaseNames)(
    "should validate prerelease name $value",
    ({ value, isValid = false }) => {
      expect(isValidPrereleaseName(value)).toBe(isValid);
    },
  );
});
