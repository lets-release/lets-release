import { z } from "zod";

import { ProxyOptions } from "src/schemas/ProxyOptions";

describe("ProxyOptions", () => {
  it("should validate false", () => {
    expect(ProxyOptions.parse(false)).toBe(false);
  });

  it("should validate a non-empty string", () => {
    const validString = "http://example.com";
    expect(ProxyOptions.parse(validString)).toBe(validString);
  });

  it("should validate an instance of URL", () => {
    const validUrl = new URL("http://example.com");
    expect(ProxyOptions.parse(validUrl)).toBe(validUrl);
  });

  it("should validate an object with a uri property", () => {
    const validObject = { uri: "http://example.com" };
    expect(ProxyOptions.parse(validObject)).toEqual(validObject);
  });

  it("should throw an error for an invalid string", () => {
    const invalidString = "";
    expect(() => ProxyOptions.parse(invalidString)).toThrow(z.ZodError);
  });

  it("should throw an error for an object without a uri property", () => {
    const invalidObject = { url: "http://example.com" };
    expect(() => ProxyOptions.parse(invalidObject)).toThrow(z.ZodError);
  });

  it("should throw an error for an object with an empty uri property", () => {
    const invalidObject = { uri: "" };
    expect(() => ProxyOptions.parse(invalidObject)).toThrow(z.ZodError);
  });
});
