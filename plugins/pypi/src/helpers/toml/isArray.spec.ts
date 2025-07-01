import { TomlValue } from "smol-toml";

import { isArray } from "src/helpers/toml/isArray";

describe("isArray", () => {
  it("should return true for arrays", () => {
    const value: TomlValue = [1, 2, 3];
    expect(isArray(value)).toBe(true);
  });

  it("should return false for non-arrays", () => {
    const value: TomlValue = 42;
    expect(isArray(value)).toBe(false);
  });
});
