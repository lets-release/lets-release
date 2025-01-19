import { shuffle } from "lodash-es";

import { comparisons } from "src/__fixtures__/comparisons";
import { getEarliestCalVer } from "src/helpers/getEarliestCalVer";

describe("getEarliestCalVer", () => {
  it("should get earliest calver", () => {
    for (const [format, { min, versions }] of Object.entries(comparisons)) {
      expect(
        getEarliestCalVer(format, shuffle([min, ...versions])),
        format,
      ).toBe(min);
    }
  });

  it("should get earliest prerelease calver", () => {
    for (const [
      format,
      { min, minPrerelease, minAlpha, minBeta, versions },
    ] of Object.entries(comparisons)) {
      if (format === "YYYY.MINOR.MICRO") {
        const list = shuffle([
          min,
          minPrerelease,
          minAlpha,
          minBeta,
          ...versions,
        ]) as string[];

        expect(getEarliestCalVer(format, list, { withPrerelease: true })).toBe(
          minPrerelease,
        );
      }
    }
  });

  it("should get earliest prerelease calver with specific prerelease name", () => {
    for (const [
      format,
      { min, minPrerelease, minAlpha, minBeta, versions },
    ] of Object.entries(comparisons)) {
      if (format === "YYYY.MINOR.MICRO") {
        const list = shuffle([
          min,
          minPrerelease,
          minAlpha,
          minBeta,
          ...versions,
        ]) as string[];

        expect(
          getEarliestCalVer(format, list, { prereleaseName: "alpha" }),
        ).toBe(minAlpha);

        expect(
          getEarliestCalVer(format, list, { prereleaseName: "beta" }),
        ).toBe(minBeta);
      }
    }
  });
});
