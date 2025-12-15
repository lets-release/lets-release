import { VersioningPrereleaseOptions } from "@lets-release/versioning";

import { semvers } from "src/__fixtures__/semvers";
import { formatSemVer } from "src/helpers/formatSemVer";
import { ParsedSemVer } from "src/types/ParsedSemVer";

describe("formatSemVer", () => {
  it.each(
    semvers.filter(
      (
        x,
      ): x is {
        value: string;
        options?: VersioningPrereleaseOptions;
        parsed: ParsedSemVer;
      } => !!x.parsed,
    ),
  )("should format semver: $value", ({ value, options, parsed }) => {
    expect(formatSemVer(parsed, options), value).toBe(value);
  });

  it("should ignore prefix option if prerelease name is digits", () => {
    expect(
      formatSemVer({
        major: 1,
        minor: 2,
        patch: 3,
        prereleaseName: "123",
        prereleaseNumber: 123,
      }),
    ).toBe(`1.2.3-123.123`);
  });

  it("should ignore suffix option if prerelease name is digits", () => {
    expect(
      formatSemVer({
        major: 1,
        minor: 2,
        patch: 3,
        prereleaseName: "123",
        prereleaseNumber: 123,
      }),
    ).toBe(`1.2.3-123.123`);
  });
});
