import { invalidFormats, validFormats } from "src/__fixtures__/formats";
import { isValidCalVerFormat } from "src/helpers/isValidCalVerFormat";

describe("isValidCalVerFormat", () => {
  it("should return true for valid calver format", () => {
    for (const format of Object.keys(validFormats)) {
      expect(isValidCalVerFormat(format)).toBe(true);
    }
  });

  it("should return false for invalid calver format", () => {
    for (const format of invalidFormats) {
      expect(isValidCalVerFormat(format)).toBe(false);
    }
  });
});
