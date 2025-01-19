import { shuffle } from "lodash-es";

import {
  list,
  max,
  maxAlpha,
  maxBeta,
  min,
} from "src/__fixtures__/comparisons";
import { getLatestSemVer } from "src/helpers/getLatestSemVer";

describe("getLatestSemVer", () => {
  it("should get latest semver", () => {
    expect(getLatestSemVer(shuffle([min, max, ...list]))).toBe(max);
  });

  it("should get latest semver before specific version", () => {
    expect(getLatestSemVer(shuffle([min, max, ...list]), { before: max })).toBe(
      getLatestSemVer(shuffle([min, ...list])),
    );
  });

  it("should get latest prerelease semver", () => {
    expect(
      getLatestSemVer(shuffle([min, max, ...list]), { withPrerelease: true }),
    ).toBe(max);
  });

  it("should get latest prerelease semver with specific prerelease name", () => {
    expect(
      getLatestSemVer(shuffle([min, max, ...list]), {
        prereleaseName: "alpha",
      }),
    ).toBe(maxAlpha);

    expect(
      getLatestSemVer(shuffle([min, max, ...list]), { prereleaseName: "beta" }),
    ).toBe(maxBeta);
  });
});
