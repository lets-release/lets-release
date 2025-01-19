import { AssetObject } from "src/schemas/AssetObject";

describe("AssetObject", () => {
  it("should validate a valid AssetObject", () => {
    const validAssetObject = {
      path: "valid/path/to/file",
      name: "file-name",
      label: "file-label",
    };

    expect(() => AssetObject.parse(validAssetObject)).not.toThrow();
  });

  it("should validate a valid AssetObject with only required fields", () => {
    const validAssetObject = {
      path: "valid/path/to/file",
    };

    expect(() => AssetObject.parse(validAssetObject)).not.toThrow();
  });

  it("should throw an error if path is missing", () => {
    const invalidAssetObject = {
      name: "file-name",
      label: "file-label",
    };

    expect(() => AssetObject.parse(invalidAssetObject)).toThrow();
  });

  it("should throw an error if path is empty", () => {
    const invalidAssetObject = {
      path: "",
      name: "file-name",
      label: "file-label",
    };

    expect(() => AssetObject.parse(invalidAssetObject)).toThrow();
  });

  it("should throw an error if name is empty", () => {
    const invalidAssetObject = {
      path: "valid/path/to/file",
      name: "",
      label: "file-label",
    };

    expect(() => AssetObject.parse(invalidAssetObject)).toThrow();
  });

  it("should throw an error if label is empty", () => {
    const invalidAssetObject = {
      path: "valid/path/to/file",
      name: "file-name",
      label: "",
    };

    expect(() => AssetObject.parse(invalidAssetObject)).toThrow();
  });
});
