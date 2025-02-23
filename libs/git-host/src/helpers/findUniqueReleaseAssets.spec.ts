import { Package } from "@lets-release/config";

import { findReleaseAssets } from "src/helpers/findReleaseAssets";
import { findUniqueReleaseAssets } from "src/helpers/findUniqueReleaseAssets";

vi.mock("src/helpers/findReleaseAssets");

const repositoryRoot = "/test/directory";
const pkg = {
  uniqueName: "npm/pkg",
} as unknown as Package;
const assets = ["asset1.txt", "asset2.txt", { path: "asset3.txt" }];
const returnedAssets = [{ path: "asset3.txt" }, "asset1.txt", "asset2.txt"];

describe("findUniqueReleaseAssets", () => {
  beforeEach(() => {
    vi.mocked(findReleaseAssets).mockReset().mockResolvedValue(assets);
  });

  it("should return unique sorted assets", async () => {
    const result = await findUniqueReleaseAssets(
      { repositoryRoot, package: pkg },
      assets,
    );

    expect(result).toEqual(returnedAssets);
  });
});
