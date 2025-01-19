import dirGlob from "dir-glob";
import { globby } from "globby";

import { findReleaseAssets } from "src/helpers/findReleaseAssets";
import { Asset } from "src/schemas/Asset";
import { AssetObject } from "src/schemas/AssetObject";

vi.mock("globby");
vi.mock("dir-glob");

const cwd = "/test/directory";

describe("findReleaseAssets", () => {
  beforeEach(() => {
    vi.mocked(globby).mockReset();
    vi.mocked(dirGlob).mockReset().mockResolvedValue([]);
  });

  it("should skip solo negated pattern", async () => {
    const asset: Asset<AssetObject> = "!**/*.js";
    const result = await findReleaseAssets({ cwd }, asset);

    expect(result).toEqual([]);
  });

  it("should return matched files for string asset", async () => {
    vi.mocked(globby).mockResolvedValue(["test/file1.js", "test/file2.js"]);

    const asset: Asset<AssetObject> = "test/*.js";
    const result = await findReleaseAssets({ cwd }, asset);

    expect(result).toEqual(["test/file1.js", "test/file2.js"]);
  });

  it("should return matched files for array asset", async () => {
    vi.mocked(globby).mockResolvedValue(["test/file1.js", "test/file2.js"]);

    const asset: Asset<AssetObject> = ["test/*.js"];
    const result = await findReleaseAssets({ cwd }, asset);

    expect(result).toEqual(["test/file1.js", "test/file2.js"]);
  });

  it("should return matched files for object asset", async () => {
    vi.mocked(globby).mockResolvedValue(["test/file1.js"]);

    const asset: Asset<AssetObject> = { path: "test/*.js" };
    const result = await findReleaseAssets({ cwd }, asset);

    expect(result).toEqual([{ path: "test/file1.js" }]);
  });

  it("should return matched files for object asset with a glob arrays in path property", async () => {
    vi.mocked(globby).mockResolvedValue(["test/file1.js"]);

    const asset: Asset<AssetObject> = { path: ["test/*.js"] };
    const result = await findReleaseAssets({ cwd }, asset);

    expect(result).toEqual([{ path: "test/file1.js" }]);
  });

  it("should handle multiple files for object asset", async () => {
    vi.mocked(globby).mockResolvedValue(["test/file1.js", "test/file2.js"]);

    const asset: Asset<AssetObject> = { path: "test/*.js" };
    const result = await findReleaseAssets({ cwd }, asset);

    expect(result).toEqual([
      { path: "test/file1.js", name: "file1.js" },
      { path: "test/file2.js", name: "file2.js" },
    ]);
  });

  it("should handle no match for string asset", async () => {
    vi.mocked(globby).mockResolvedValue([]);

    const asset: Asset<AssetObject> = "test/*.js";
    const result = await findReleaseAssets({ cwd }, asset);

    expect(result).toEqual(["test/*.js"]);
  });

  it("should handle no match for array asset", async () => {
    vi.mocked(globby).mockResolvedValue([]);

    const asset: Asset<AssetObject> = ["test/*.js"];
    const result = await findReleaseAssets({ cwd }, asset);

    expect(result).toEqual(["test/*.js"]);
  });

  it("should handle no match for object asset", async () => {
    vi.mocked(globby).mockResolvedValue([]);

    const asset: Asset<AssetObject> = { path: "test/*.js" };
    const result = await findReleaseAssets({ cwd }, asset);

    expect(result).toEqual([{ path: "test/*.js" }]);
  });

  it("should handle no match for object asset with a glob arrays in path property", async () => {
    vi.mocked(globby).mockResolvedValue([]);

    const asset: Asset<AssetObject> = { path: ["test/*.js"] };
    const result = await findReleaseAssets({ cwd }, asset);

    expect(result).toEqual([{ path: "test/*.js" }]);
  });
});
