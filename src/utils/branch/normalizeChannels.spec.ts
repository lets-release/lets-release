import { normalizeChannels } from "src/utils/branch/normalizeChannels";

describe("normalizeChannels", () => {
  it("should return default channels if channels is nil", () => {
    expect(normalizeChannels("name", [null])).toEqual({ default: [null] });
  });

  it("should return default channels if channels is an empty array", () => {
    expect(normalizeChannels("name", [null], [])).toEqual({ default: [null] });
  });

  it("should return channels as default channels if channels is an non-empty array", () => {
    expect(
      normalizeChannels("name", [null], ["foo-${name}", "bar-${name}"]),
    ).toEqual({ default: ["foo-name", "bar-name"] });
  });

  it("should return object with default channels if channels is an object without default channels", () => {
    expect(normalizeChannels("name", [null], {})).toEqual({
      default: [null],
    });
  });

  it("should return object with default channels if channels is an object with empty array as channels", () => {
    expect(
      normalizeChannels("name", [null], {
        default: [],
        npm: [],
      }),
    ).toEqual({
      default: [null],
      npm: [null],
    });
  });

  it("should return object with default channels if channels is an object with non empty array as channels", () => {
    expect(
      normalizeChannels("name", [null], {
        default: ["default"],
        npm: ["foo-${name}", "bar-${name}"],
      }),
    ).toEqual({
      default: ["default"],
      npm: ["foo-name", "bar-name"],
    });
  });
});
