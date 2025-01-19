import { AssetTarget } from "src/enums/AssetTarget";
import { AssetType } from "src/enums/AssetType";
import { GenericPackageStatus } from "src/enums/GenericPackageStatus";
import { GitLabAssetObject } from "src/schemas/GitLabAssetObject";

describe("GitLabAssetObject", () => {
  it("should validate with only path set", () => {
    const result = GitLabAssetObject.safeParse({ path: "some/path" });
    expect(result.success).toBe(true);
  });

  it("should validate with only url set", () => {
    const result = GitLabAssetObject.safeParse({ url: "http://example.com" });
    expect(result.success).toBe(true);
  });

  it("should fail validation if neither path nor url is set", () => {
    const result = GitLabAssetObject.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Either `path` or `url` must be set.",
      );
    }
  });

  it("should default type to AssetType.Other", () => {
    const result = GitLabAssetObject.parse({ path: "some/path" });
    expect(result.type).toBe(AssetType.Other);
  });

  it("should default target to AssetTarget.ProjectUpload", () => {
    const result = GitLabAssetObject.parse({ path: "some/path" });
    expect(result.target).toBe(AssetTarget.ProjectUpload);
  });

  it("should default status to GenericPackageStatus.Default", () => {
    const result = GitLabAssetObject.parse({ path: "some/path" });
    expect(result.status).toBe(GenericPackageStatus.Default);
  });

  it("should allow setting optional fields", () => {
    const result = GitLabAssetObject.parse({
      path: "some/path",
      url: "http://example.com",
      type: AssetType.Package,
      filepath: "some/filepath",
      target: AssetTarget.GenericPackage,
      status: GenericPackageStatus.Hidden,
    });
    expect(result.url).toBe("http://example.com");
    expect(result.type).toBe(AssetType.Package);
    expect(result.filepath).toBe("some/filepath");
    expect(result.target).toBe(AssetTarget.GenericPackage);
    expect(result.status).toBe(GenericPackageStatus.Hidden);
  });
});
