import { isNil } from "lodash-es";

import { calvers } from "src/__fixtures__/calvers";
import { isValidPrereleaseCalVer } from "src/helpers/isValidPrereleaseCalVer";

describe("isValidPrereleaseCalVer", () => {
  it("should return true for valid prerelease calver", () => {
    for (const [format, { values }] of Object.entries(calvers)) {
      for (const { value, options, parsed } of values) {
        if (
          parsed &&
          (parsed.prereleaseName || !isNil(parsed.prereleaseNumber))
        ) {
          expect(
            isValidPrereleaseCalVer(format, value, {
              ...options,
              prereleaseName: parsed.prereleaseName,
            }),
            value,
          ).toBe(true);
        }
      }
    }
  });

  it("should return false for invalid prerelease calver", () => {
    for (const [format, { values }] of Object.entries(calvers)) {
      for (const { value, options, parsed } of values) {
        if (parsed) {
          if (!parsed.prereleaseName && isNil(parsed.prereleaseNumber)) {
            expect(isValidPrereleaseCalVer(format, value, options), value).toBe(
              false,
            );
          }
        } else {
          expect(isValidPrereleaseCalVer(format, value, options), value).toBe(
            false,
          );
        }
      }
    }
  });
});
