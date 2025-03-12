import { isString } from "./isString";

describe("isString", () => {
  it("should return true for string values", () => {
    expect(isString("test")).toBe(true);
  });

  it("should return false for non-string values", () => {
    expect(isString(123)).toBe(false);
    expect(isString(true)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString([])).toBe(false);
  });
});
