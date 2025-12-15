import { semvers } from "src/__fixtures__/semvers";
import { parseSemVer } from "src/helpers/parseSemVer";

describe("parseSemVer", () => {
  const validSemvers = semvers.filter((sv) => sv.parsed);
  const invalidSemvers = semvers.filter((sv) => !sv.parsed);

  it.each(validSemvers)(
    "should parse valid semver: $value",
    ({ value, prereleaseName, parsed }) => {
      expect(parseSemVer(value, prereleaseName), value).toEqual(parsed);
    },
  );

  it.each(invalidSemvers)(
    "should throw error for invalid semver: $value",
    ({ value, prereleaseName }) => {
      expect(() => parseSemVer(value, prereleaseName), value).toThrow(
        TypeError,
      );
    },
  );
});
