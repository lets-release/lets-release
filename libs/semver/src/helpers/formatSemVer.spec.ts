import { semvers } from "src/__fixtures__/semvers";
import { DEFAULT_SEMVER_PRERELEASE_OPTIONS } from "src/constants/DEFAULT_SEMVER_PRERELEASE_OPTIONS";
import { formatSemVer } from "src/helpers/formatSemVer";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";
import { ParsedSemVer } from "src/types/ParsedSemVer";

describe("formatSemVer", () => {
  it.each(
    semvers.filter(
      (
        x,
      ): x is {
        value: string;
        options?: SemVerPrereleaseOptions;
        parsed: ParsedSemVer;
      } => !!x.parsed,
    ),
  )("should format semver: $value", ({ value, parsed }) => {
    expect(formatSemVer(parsed), value).toBe(value);
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
