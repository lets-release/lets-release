import { calvers } from "src/__fixtures__/calvers";
import { parseCalVer } from "src/helpers/parseCalVer";

describe("parseCalVer", () => {
  describe.each(Object.entries(calvers))(
    "format: $0",
    (format, { tokens, tokenValues, values }) => {
      const validCalvers = values.filter((cv) => cv.parsed);
      const invalidCalvers = values.filter((cv) => !cv.parsed);

      it.each(validCalvers)(
        "should parse valid calver: $value",
        ({ value, parsed }) => {
          expect(
            parseCalVer(format, value, parsed?.prereleaseName),
            value,
          ).toEqual({
            ...parsed,
            tokens,
            tokenValues,
          });
        },
      );

      it.each(invalidCalvers)(
        "should throw error for invalid calver: $value",
        ({ value, parsed }) => {
          expect(
            () => parseCalVer(format, value, parsed?.prereleaseName),
            value,
          ).toThrow(TypeError);
        },
      );
    },
  );
});
