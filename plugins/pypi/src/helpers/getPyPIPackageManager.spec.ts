import { existsSync } from "node:fs";
import path from "node:path";

import { findUp } from "find-up-simple";

import { getPyPIPackageManager } from "src/helpers/getPyPIPackageManager";

vi.mock("node:fs");
vi.mock("find-up-simple");

const workspaceRoot = "/path/to/workspace";
const pkgRoot = `${workspaceRoot}/package`;

describe("getPyPIPackageManager", () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReset();
    vi.mocked(findUp).mockReset();
  });

  it("should return uv package manager if uv.lock exists in pkgRoot", async () => {
    vi.mocked(existsSync).mockImplementation(
      (filePath) => filePath === path.resolve(pkgRoot, "uv.lock"),
    );

    const result = await getPyPIPackageManager(pkgRoot);

    expect(result).toEqual({
      name: "uv",
      version: "*",
      root: pkgRoot,
    });
  });

  it("should return poetry package manager if poetry.lock exists in pkgRoot", async () => {
    vi.mocked(existsSync).mockImplementation(
      (filePath) => filePath === path.resolve(pkgRoot, "poetry.lock"),
    );

    const result = await getPyPIPackageManager(pkgRoot);

    expect(result).toEqual({
      name: "poetry",
      version: "*",
      root: pkgRoot,
    });
  });

  it("should return uv package manager if uv.lock is found up the directory tree", async () => {
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(findUp).mockResolvedValue(path.resolve(workspaceRoot, "uv.lock"));

    const result = await getPyPIPackageManager(pkgRoot);

    expect(result).toEqual({
      name: "uv",
      version: "*",
      root: path.dirname(path.resolve(workspaceRoot, "uv.lock")),
    });
  });

  it("should return undefined if no lock file is found", async () => {
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(findUp).mockResolvedValue(undefined);

    const result = await getPyPIPackageManager(pkgRoot);

    expect(result).toBeUndefined();
  });
});
