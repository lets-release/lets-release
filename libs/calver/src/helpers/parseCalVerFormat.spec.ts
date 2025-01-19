import { random } from "lodash-es";

import { invalidFormats, validFormats } from "src/__fixtures__/formats";
import { parseCalVerFormat } from "src/helpers/parseCalVerFormat";
import { CalVerTokenValues } from "src/types/CalVerTokenValues";

describe("parseCalVerFormat", () => {
  it("should parse valid calver format", () => {
    for (const [format, { tokens, regex }] of Object.entries(validFormats)) {
      const parsed = parseCalVerFormat(format);

      for (const key in parsed.tokens) {
        expect(parsed.tokens[key as keyof CalVerTokenValues]).toBe(
          tokens[key as keyof CalVerTokenValues],
        );
      }

      expect(parsed.regex, format).toBe(regex);

      const { tokens: parsedTokens } = parseCalVerFormat(
        format.replaceAll(".", [".", "_", "-"][random(0, 2)]),
      );

      for (const key in parsedTokens) {
        expect(parsedTokens[key as keyof CalVerTokenValues]).toBe(
          tokens[key as keyof CalVerTokenValues],
        );
      }
    }
  });

  it("should throw for invalid calver format", () => {
    for (const format of invalidFormats) {
      expect(() => parseCalVerFormat(format)).toThrow(TypeError);
    }
  });
});
