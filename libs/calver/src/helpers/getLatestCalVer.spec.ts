import { shuffle } from "lodash-es";

import { comparisons } from "src/__fixtures__/comparisons";
import { getLatestCalVer } from "src/helpers/getLatestCalVer";

describe("getLatestCalVer", () => {
  describe.each(Object.entries(comparisons))(
    "format: %s",
    (format, { min, max, versions }) => {
      it("should get latest calver", () => {
        expect(
          getLatestCalVer(format, shuffle([min, max, ...versions])),
          format,
        ).toBe(max);
      });

      it("should get latest calver before specific version", () => {
        expect(
          getLatestCalVer(format, shuffle([min, max, ...versions]), {
            before: max,
          }),
          format,
        ).toBe(getLatestCalVer(format, shuffle([min, ...versions])));
      });
    },
  );

  it("should get latest prerelease calver", () => {
    const format = "YYYY.MINOR.MICRO";
    const { min, max, maxAlpha, maxBeta, versions } = comparisons[format];

    const list = shuffle([
      min,
      max,
      maxAlpha,
      maxBeta,
      ...versions,
    ]) as string[];

    expect(getLatestCalVer(format, list, { withPrerelease: true })).toBe(max);
  });

  it("should get latest prerelease calver with specific prerelease name", () => {
    const format = "YYYY.MINOR.MICRO";
    const { min, max, maxAlpha, maxBeta, versions } = comparisons[format];

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
  });
});
