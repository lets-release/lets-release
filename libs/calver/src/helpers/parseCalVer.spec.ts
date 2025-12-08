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
        ({ value, options, parsed }) => {
          expect(parseCalVer(format, value, options), value).toEqual({
            ...parsed,
            tokens,
            tokenValues,
          });
        },
      );

      it.each(invalidCalvers)(
        "should throw error for invalid calver: $value",
        ({ value, options }) => {
          expect(() => parseCalVer(format, value, options), value).toThrow(
            TypeError,
          );
        },
      );
    },
  );

  it("should not reset prefix when options.prefix is empty string", () => {
    const result = parseCalVer("YYYY", "2001zeta", { prefix: "" });
    expect(result.prereleaseOptions.prefix).toBe("");
    expect(result.prereleaseName).toBe("zeta");
  });
});
