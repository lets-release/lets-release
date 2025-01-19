import { GitLabAsset } from "src/schemas/GitLabAsset";

describe("GitLabAsset schema", () => {
  it("should validate a non-empty string", () => {
    const result = GitLabAsset.safeParse("valid-string");
    expect(result.success).toBe(true);
  });

  it("should invalidate an empty string", () => {
    const result = GitLabAsset.safeParse("");
    expect(result.success).toBe(false);
  });

  it("should validate an array of non-empty strings", () => {
    const result = GitLabAsset.safeParse(["valid-string1", "valid-string2"]);
    expect(result.success).toBe(true);
  });

  it("should invalidate an array with an empty string", () => {
    const result = GitLabAsset.safeParse(["valid-string", ""]);
    expect(result.success).toBe(false);
  });

  it("should validate a GitLabAssetObject", () => {
    const validObject = {
      path: "dist/**",
      label: "A valid label",
      type: "package",
      filepath: "path/to/file",
      target: "project_upload",
      status: "default",
    };
    const result = GitLabAsset.safeParse(validObject);
    expect(result.success).toBe(true);
  });

  it("should invalidate a GitLabAssetObject with missing required fields", () => {
    const invalidObject = {
      label: "A valid label",
      type: "package",
      filepath: "path/to/file",
      target: "project_upload",
      status: "default",
    };
    const result = GitLabAsset.safeParse(invalidObject);
    expect(result.success).toBe(false);
  });

  it("should invalidate a GitLabAssetObject with invalid field values", () => {
    const invalidObject = {
      path: "",
      label: "A valid label",
      type: "invalid-type",
      filepath: "path/to/file",
      target: "project_upload",
      status: "default",
    };
    const result = GitLabAsset.safeParse(invalidObject);
    expect(result.success).toBe(false);
  });
});
