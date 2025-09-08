/* eslint-disable @typescript-eslint/no-deprecated */
import dirGlob from "dir-glob";
import { glob } from "tinyglobby";

import { Package } from "@lets-release/config";

import { findReleaseAssets } from "src/helpers/findReleaseAssets";
import { Asset } from "src/schemas/Asset";
import { AssetObject } from "src/schemas/AssetObject";

vi.mock("dir-glob");
vi.mock("tinyglobby");

const repositoryRoot = "/test/directory";
const pkg = {
  uniqueName: "npm/pkg",
} as unknown as Package;

describe("findReleaseAssets", () => {
  beforeEach(() => {
    vi.mocked(dirGlob).mockReset().mockResolvedValue([]);
    vi.mocked(glob).mockReset();
  });

  it("should skip solo negated pattern", async () => {
    const asset: Asset<AssetObject> = "!**/*.js";
    const result = await findReleaseAssets(
      {
        repositoryRoot,
        package: pkg,
      },
      asset,
    );

    expect(result).toEqual([]);
  });

  it("should return matched files for string asset", async () => {
    vi.mocked(glob).mockResolvedValue(["test/file1.js", "test/file2.js"]);

    const asset: Asset<AssetObject> = "test/*.js";
    const result = await findReleaseAssets(
      {
        repositoryRoot,
        package: pkg,
      },
      asset,
    );

    expect(result).toEqual(["test/file1.js", "test/file2.js"]);
  });

  it("should return matched files for array asset", async () => {
    vi.mocked(glob).mockResolvedValue(["test/file1.js", "test/file2.js"]);

    const asset: Asset<AssetObject> = ["test/*.js"];
    const result = await findReleaseAssets(
      {
        repositoryRoot,
        package: pkg,
      },
      asset,
    );

    expect(result).toEqual(["test/file1.js", "test/file2.js"]);
  });

  it("should return matched files for object asset", async () => {
    vi.mocked(glob).mockResolvedValue(["test/file1.js"]);

    const asset: Asset<AssetObject> = { path: "test/*.js" };
    const result = await findReleaseAssets(
      {
        repositoryRoot,
        package: pkg,
      },
      asset,
    );

    expect(result).toEqual([{ path: "test/file1.js" }]);
  });

  it("should return matched files for object asset with a glob arrays in path property", async () => {
    vi.mocked(glob).mockResolvedValue(["test/file1.js"]);

    const asset: Asset<AssetObject> = { path: ["test/*.js"] };
    const result = await findReleaseAssets(
      {
        repositoryRoot,
        package: pkg,
      },
      asset,
    );

    expect(result).toEqual([{ path: "test/file1.js" }]);
  });

  it("should handle multiple files for object asset", async () => {
    vi.mocked(glob).mockResolvedValue(["test/file1.js", "test/file2.js"]);

    const asset: Asset<AssetObject> = { path: "test/*.js" };
    const result = await findReleaseAssets(
      {
        repositoryRoot,
        package: pkg,
      },
      asset,
    );

    expect(result).toEqual([
      { path: "test/file1.js", name: "file1.js" },
      { path: "test/file2.js", name: "file2.js" },
    ]);
  });

  it("should handle no match for string asset", async () => {
    vi.mocked(glob).mockResolvedValue([]);

    const asset: Asset<AssetObject> = "test/*.js";
    const result = await findReleaseAssets(
      {
        repositoryRoot,
        package: pkg,
      },
      asset,
    );

    expect(result).toEqual(["test/*.js"]);
  });

  it("should handle no match for array asset", async () => {
    vi.mocked(glob).mockResolvedValue([]);

    const asset: Asset<AssetObject> = ["test/*.js"];
    const result = await findReleaseAssets(
      {
        repositoryRoot,
        package: pkg,
      },
      asset,
    );

    expect(result).toEqual(["test/*.js"]);
  });

  it("should handle no match for object asset", async () => {
    vi.mocked(glob).mockResolvedValue([]);

    const asset: Asset<AssetObject> = { path: "test/*.js" };
    const result = await findReleaseAssets(
      {
        repositoryRoot,
        package: pkg,
      },
      asset,
    );

    expect(result).toEqual([{ path: "test/*.js" }]);
  });

  it("should handle no match for object asset with a glob arrays in path property", async () => {
    vi.mocked(glob).mockResolvedValue([]);

    const asset: Asset<AssetObject> = { path: ["test/*.js"] };
    const result = await findReleaseAssets(
      {
        repositoryRoot,
        package: pkg,
      },
      asset,
    );

    expect(result).toEqual([{ path: "test/*.js" }]);
  });
});
