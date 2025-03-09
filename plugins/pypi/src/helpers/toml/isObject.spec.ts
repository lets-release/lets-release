import { TomlDate } from "smol-toml";

import { isObject } from "src/helpers/toml/isObject";

describe("isObject", () => {
  it("should return true for plain objects", () => {
    expect(isObject({ key: "value" })).toBe(true);
  });

  it("should return false for arrays", () => {
    expect(isObject(["value"])).toBe(false);
  });

  it("should return false for TomlDate instances", () => {
    expect(isObject(new TomlDate(new Date()))).toBe(false);
  });

  it("should return false for primitive values", () => {
    expect(isObject("string")).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject(true)).toBe(false);
  });
});
