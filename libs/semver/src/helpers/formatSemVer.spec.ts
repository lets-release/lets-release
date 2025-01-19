import { semvers } from "src/__fixtures__/semvers";
import { DEFAULT_SEMVER_PRERELEASE_OPTIONS } from "src/constants/DEFAULT_SEMVER_PRERELEASE_OPTIONS";
import { formatSemVer } from "src/helpers/formatSemVer";

describe("formatSemVer", () => {
  it("should format semver", () => {
    for (const { value, parsed } of semvers) {
      if (parsed) {
        expect(formatSemVer(parsed), value).toBe(value);
      }
    }
  });

  it("should ignore prefix option if prerelease name is digits", () => {
    expect(
      formatSemVer(
        {
          major: 1,
          minor: 2,
          patch: 3,
          prereleaseName: "123",
          prereleaseNumber: 123,
          prereleaseOptions: DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        },
        {
          prefix: "",
        },
      ),
    ).toBe(`1.2.3-123.123`);
  });

  it("should ignore suffix option if prerelease name is digits", () => {
    expect(
      formatSemVer(
        {
          major: 1,
          minor: 2,
          patch: 3,
          prereleaseName: "123",
          prereleaseNumber: 123,
          prereleaseOptions: DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        },
        {
          suffix: "",
        },
      ),
    ).toBe(`1.2.3-123.123`);
  });
});
