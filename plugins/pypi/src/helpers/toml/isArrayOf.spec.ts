import { TomlValue } from "smol-toml";

import { isArrayOf } from "src/helpers/toml/isArrayOf";
import { isString } from "src/helpers/toml/isString";

describe("isArrayOf", () => {
  it("should return true for arrays of strings", () => {
    const value: TomlValue = ["a", "b", "c"];
    expect(isArrayOf(value, isString)).toBe(true);
  });

  it("should return false for arrays with non-string elements", () => {
    const value: TomlValue = ["a", 2, "c"];
    expect(isArrayOf(value, isString)).toBe(false);
  });

  it("should return false for non-arrays", () => {
    const value: TomlValue = 42;
    expect(isArrayOf(value, isString)).toBe(false);
  });
});
