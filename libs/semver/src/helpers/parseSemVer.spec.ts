import { semvers } from "src/__fixtures__/semvers";
import { parseSemVer } from "src/helpers/parseSemVer";

describe("parseSemVer", () => {
  it("should parse valid semver", () => {
    for (const { value, options, parsed } of semvers) {
      if (parsed) {
        expect(parseSemVer(value, options), value).toEqual(parsed);
      }
    }
  });

  it("should throw error for invalid semver", () => {
    for (const { value, options, parsed } of semvers) {
      if (!parsed) {
        expect(() => parseSemVer(value, options), value).toThrow(TypeError);
      }
    }
  });
});
