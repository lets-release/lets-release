import { calvers } from "src/__fixtures__/calvers";
import { isValidCalVer } from "src/helpers/isValidCalVer";

describe("isValidCalVer", () => {
  it("should validate calver", () => {
    for (const [format, { values }] of Object.entries(calvers)) {
      for (const { value, parsed } of values) {
        expect(
          isValidCalVer(format, value, parsed?.prereleaseName),
          `${format} ${value}`,
        ).toBe(!!parsed);
      }
    }
  });
});
