import { semvers } from "src/__fixtures__/semvers";
import { parseSemVer } from "src/helpers/parseSemVer";

describe("parseSemVer", () => {
  const validSemvers = semvers.filter((sv) => sv.parsed);
  const invalidSemvers = semvers.filter((sv) => !sv.parsed);

  it.each(validSemvers)(
    "should parse valid semver: $value",
    ({ value, options, parsed }) => {
      expect(parseSemVer(value, options), value).toEqual(parsed);
    },
  );

  it.each(invalidSemvers)(
    "should throw error for invalid semver: $value",
    ({ value, options }) => {
      expect(() => parseSemVer(value, options), value).toThrow(TypeError);
    },
  );
});
