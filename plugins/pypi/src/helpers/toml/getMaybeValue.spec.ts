import { TomlValue } from "smol-toml";

import { getMaybeValue } from "src/helpers/toml/getMaybeValue";
import { isString } from "src/helpers/toml/isString";

describe("getMaybeValue", () => {
  it("should return the value if it is defined and passes the checker", () => {
    const value: TomlValue = "test";

    const result = getMaybeValue(value, isString);

    expect(result).toBe(value);
  });

  it("should return undefined if the value is undefined", () => {
    const value: TomlValue | undefined = undefined;

    const result = getMaybeValue(value, isString);

    expect(result).toBeUndefined();
  });

  it("should return undefined if the value does not pass the checker", () => {
    const value: TomlValue = 123;

    const result = getMaybeValue(value, isString);

    expect(result).toBeUndefined();
  });
});
