import { isNil } from "lodash-es";

import { semvers } from "src/__fixtures__/semvers";
import { isValidPrereleaseSemVer } from "src/helpers/isValidPrereleaseSemVer";

describe("isValidPrereleaseSemVer", () => {
  const validPrereleaseSemvers = semvers.filter(
    ({ parsed }) =>
      parsed && (parsed.prereleaseName || !isNil(parsed.prereleaseNumber)),
  );
  const invalidPrereleaseSemvers = semvers.filter(
    ({ parsed }) =>
      !parsed || (!parsed.prereleaseName && isNil(parsed.prereleaseNumber)),
  );

  it.each(validPrereleaseSemvers)(
    "should return true for valid prerelease semver: $value",
    ({ value, prereleaseName }) => {
      expect(isValidPrereleaseSemVer(value, prereleaseName), value).toBe(true);
    },
  );

  it.each(invalidPrereleaseSemvers)(
    "should return false for invalid prerelease semver: $value",
    ({ value, prereleaseName }) => {
      expect(isValidPrereleaseSemVer(value, prereleaseName), value).toBe(false);
    },
  );
});
