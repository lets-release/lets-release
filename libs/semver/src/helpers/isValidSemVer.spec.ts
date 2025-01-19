import { semvers } from "src/__fixtures__/semvers";
import { isValidSemVer } from "src/helpers/isValidSemVer";

describe("isValidSemVer", () => {
  it("should validate semver", () => {
    for (const { value, options, parsed } of semvers) {
      expect(isValidSemVer(value, options), value).toBe(!!parsed);
    }
  });
});
