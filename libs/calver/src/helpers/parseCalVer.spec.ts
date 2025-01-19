import { calvers } from "src/__fixtures__/calvers";
import { parseCalVer } from "src/helpers/parseCalVer";

describe("parseCalVer", () => {
  it("should parse valid calver", () => {
    for (const [format, { tokens, tokenValues, values }] of Object.entries(
      calvers,
    )) {
      for (const { value, options, parsed } of values) {
        if (parsed) {
          expect(
            parseCalVer(format, value, options),
            `${format} ${value}`,
          ).toEqual({
            ...parsed,
            tokens,
            tokenValues,
          });
        }
      }
    }
  });

  it("should throw for invalid calver", () => {
    for (const [format, { values }] of Object.entries(calvers)) {
      for (const { value, options, parsed } of values) {
        if (!parsed) {
          expect(
            () => parseCalVer(format, value, options),
            `${format} ${value}`,
          ).toThrow(TypeError);
        }
      }
    }
  });
});
