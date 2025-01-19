import { Asset } from "src/schemas/Asset";

describe("Asset", () => {
  it("should validate a non-empty string", () => {
    const result = Asset.safeParse("dist/**/*.js");

    expect(result.success).toBe(true);
  });

  it("should validate an array of non-empty strings", () => {
    const result = Asset.safeParse(["dist/**/*.js", "!dist/**/*.css"]);

    expect(result.success).toBe(true);
  });

  it("should validate an object with required path", () => {
    const result = Asset.safeParse({ path: "dist/**/*.js" });

    expect(result.success).toBe(true);
  });

  it("should validate an object with optional name and label", () => {
    const result = Asset.safeParse({
      path: "dist/**/*.js",
      name: "myLib.js",
      label: "My Library",
    });

    expect(result.success).toBe(true);
  });

  it("should fail validation for an empty string", () => {
    const result = Asset.safeParse("");

    expect(result.success).toBe(false);
  });

  it("should fail validation for an array with an empty string", () => {
    const result = Asset.safeParse(["dist/**/*.js", ""]);

    expect(result.success).toBe(false);
  });

  it("should fail validation for an object without path", () => {
    const result = Asset.safeParse({ name: "myLib.js" });

    expect(result.success).toBe(false);
  });

  it("should fail validation for an object with empty path", () => {
    const result = Asset.safeParse({ path: "" });

    expect(result.success).toBe(false);
  });

  it("should fail validation for an object with empty name", () => {
    const result = Asset.safeParse({ path: "dist/**/*.js", name: "" });

    expect(result.success).toBe(false);
  });

  it("should fail validation for an object with empty label", () => {
    const result = Asset.safeParse({ path: "dist/**/*.js", label: "" });

    expect(result.success).toBe(false);
  });
});
