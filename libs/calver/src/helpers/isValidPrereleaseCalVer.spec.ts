import { isNil } from "lodash-es";

import { calvers } from "src/__fixtures__/calvers";
import { isValidPrereleaseCalVer } from "src/helpers/isValidPrereleaseCalVer";

describe("isValidPrereleaseCalVer", () => {
  describe.each(Object.entries(calvers))("format: $0", (format, { values }) => {
    const validPrereleaseCalvers = values.filter(
      ({ parsed }) =>
        parsed && (parsed.prereleaseName || !isNil(parsed.prereleaseNumber)),
    );
    const invalidPrereleaseCalvers = values.filter(
      ({ parsed }) =>
        !parsed || (!parsed.prereleaseName && isNil(parsed.prereleaseNumber)),
    );

    it.each(validPrereleaseCalvers)(
      "should return true for valid prerelease calver: $value",
      ({ value, options, parsed }) => {
        expect(
          isValidPrereleaseCalVer(format, value, {
            ...options,
            prereleaseName: parsed?.prereleaseName,
          }),
          value,
        ).toBe(true);
      },
    );

    it.each(invalidPrereleaseCalvers)(
      "should return false for invalid prerelease calver: $value",
      ({ value, options }) => {
        expect(isValidPrereleaseCalVer(format, value, options), value).toBe(
          false,
        );
      },
    );
  });
});
