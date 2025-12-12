import { prereleaseNames } from "src/__fixtures__/prereleases";
import { isValidPrereleaseName } from "src/helpers/isValidPrereleaseName";

describe("isValidPrereleaseName", () => {
  it.each(prereleaseNames)(
    "should validate prerelease name $value",
    ({ value, isValid }) => {
      expect(isValidPrereleaseName(value), value).toBe(isValid ?? false);
    },
  );
});
