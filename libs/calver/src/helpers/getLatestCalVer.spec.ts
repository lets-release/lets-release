import { shuffle } from "lodash-es";

import { comparisons } from "src/__fixtures__/comparisons";
import { getLatestCalVer } from "src/helpers/getLatestCalVer";

describe("getLatestCalVer", () => {
  it("should get latest calver", () => {
    for (const [format, { min, max, versions }] of Object.entries(
      comparisons,
    )) {
      expect(
        getLatestCalVer(format, shuffle([min, max, ...versions])),
        format,
      ).toBe(max);
    }
  });

  it("should get latest calver before specific version", () => {
    for (const [format, { min, max, versions }] of Object.entries(
      comparisons,
    )) {
      expect(
        getLatestCalVer(format, shuffle([min, max, ...versions]), {
          before: max,
        }),
        format,
      ).toBe(getLatestCalVer(format, shuffle([min, ...versions])));
    }
  });

  it("should get latest prerelease calver", () => {
    for (const [
      format,
      { min, max, maxAlpha, maxBeta, versions },
    ] of Object.entries(comparisons)) {
      if (format === "YYYY.MINOR.MICRO") {
        const list = shuffle([
          min,
          max,
          maxAlpha,
          maxBeta,
          ...versions,
        ]) as string[];

        expect(getLatestCalVer(format, list, { withPrerelease: true })).toBe(
          max,
        );
      }
    }
  });

  it("should get latest prerelease calver with specific prerelease name", () => {
    for (const [
      format,
      { min, max, maxAlpha, maxBeta, versions },
    ] of Object.entries(comparisons)) {
      if (format === "YYYY.MINOR.MICRO") {
        const list = shuffle([
          min,
          max,
          maxAlpha,
          maxBeta,
          ...versions,
        ]) as string[];

        expect(getLatestCalVer(format, list, { prereleaseName: "alpha" })).toBe(
          maxAlpha,
        );

        expect(getLatestCalVer(format, list, { prereleaseName: "beta" })).toBe(
          maxBeta,
        );
      }
    }
  });
});
