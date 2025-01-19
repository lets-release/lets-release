import { calvers } from "src/__fixtures__/calvers";
import { isValidCalVer } from "src/helpers/isValidCalVer";

describe("isValidCalVer", () => {
  it("should validate calver", () => {
    for (const [format, { values }] of Object.entries(calvers)) {
      for (const { value, options, parsed } of values) {
        expect(
          isValidCalVer(format, value, options),
          `${format} ${value}`,
        ).toBe(!!parsed);
      }
    }
  });
});
