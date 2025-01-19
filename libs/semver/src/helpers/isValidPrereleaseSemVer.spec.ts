import { isNil } from "lodash-es";

import { semvers } from "src/__fixtures__/semvers";
import { isValidPrereleaseSemVer } from "src/helpers/isValidPrereleaseSemVer";

describe("isValidPrereleaseSemVer", () => {
  it("should return true for valid prerelease semver", () => {
    for (const { value, options, parsed } of semvers) {
      if (
        parsed &&
        (parsed.prereleaseName || !isNil(parsed.prereleaseNumber))
      ) {
        expect(
          isValidPrereleaseSemVer(value, {
            ...options,
            prereleaseName: parsed.prereleaseName,
          }),
          value,
        ).toBe(true);
      }
    }
  });

  it("should return false for invalid prerelease semver", () => {
    for (const { value, options, parsed } of semvers) {
      if (parsed) {
        if (!parsed.prereleaseName && isNil(parsed.prereleaseNumber)) {
          expect(isValidPrereleaseSemVer(value, options), value).toBe(false);
        }
      } else {
        expect(isValidPrereleaseSemVer(value, options), value).toBe(false);
      }
    }
  });
});
