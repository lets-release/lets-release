import { comparePrereleaseVersions } from "src/helpers/comparePrereleaseVersions";

describe("comparePrereleaseVersions", () => {
  it("should compare prerelease versions", () => {
    expect(
      comparePrereleaseVersions(
        {
          prereleaseName: "a",
        },
        {},
      ),
    ).toBe(-1);

    expect(
      comparePrereleaseVersions(
        {},
        {
          prereleaseName: "a",
        },
      ),
    ).toBe(1);

    expect(comparePrereleaseVersions({}, {})).toBe(0);

    expect(
      comparePrereleaseVersions(
        {
          prereleaseName: "",
        },
        {
          prereleaseName: "a",
        },
      ),
    ).toBe(1);

    expect(
      comparePrereleaseVersions(
        {
          prereleaseName: "a",
          prereleaseNumber: 1,
        },
        {
          prereleaseName: "a",
          prereleaseNumber: 1,
        },
      ),
    ).toBe(0);
  });
});
