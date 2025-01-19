import { shuffle } from "lodash-es";

import {
  list,
  max,
  min,
  minAlpha,
  minBeta,
  minPrerelease,
} from "src/__fixtures__/comparisons";
import { getEarliestSemVer } from "src/helpers/getEarliestSemVer";

describe("getEarliestSemVer", () => {
  it("should get earliest semver", () => {
    expect(getEarliestSemVer(shuffle([min, max, ...list]))).toBe(min);
  });

  it("should get earliest prerelease semver", () => {
    expect(
      getEarliestSemVer(shuffle([min, max, ...list]), { withPrerelease: true }),
    ).toBe(minPrerelease);
  });

  it("should get earliest semver with specific prerelease name", () => {
    expect(
      getEarliestSemVer(shuffle([min, max, ...list]), {
        prereleaseName: "alpha",
      }),
    ).toBe(minAlpha);

    expect(
      getEarliestSemVer(shuffle([min, max, ...list]), {
        prereleaseName: "beta",
      }),
    ).toBe(minBeta);
  });
});
