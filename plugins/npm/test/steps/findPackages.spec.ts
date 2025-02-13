import { mkdir } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson } from "fs-extra";
import { temporaryDirectory } from "tempy";

import { FindPackagesContext } from "@lets-release/config";

import { findPackages } from "src/steps/findPackages";

const cwd = temporaryDirectory();
const info = vi.fn();
const warn = vi.fn();
const logger = { info, warn };
const pkgA = {
  name: "find-packages-a",
};
const pkgB = {
  name: "find-packages-b",
};

describe("findPackages", () => {
  beforeAll(async () => {
    await mkdir(path.resolve(cwd, "packages", "a"), { recursive: true });
    await outputJson(path.resolve(cwd, "packages", "a", "package.json"), pkgA);
    await $({ cwd: path.resolve(cwd, "packages", "a") })`npm install`;
    await mkdir(path.resolve(cwd, "packages", "b"), { recursive: true });
    await outputJson(path.resolve(cwd, "packages", "b", "package.json"), pkgB);
    await $({ cwd: path.resolve(cwd, "packages", "b") })`npm install`;
    await mkdir(path.resolve(cwd, "packages", "c"), { recursive: true });
    await outputJson(path.resolve(cwd, "packages", "c", "package.json"), {
      name: "find-packages-c",
    });
    await mkdir(path.resolve(cwd, "packages", "d"), { recursive: true });
  });

  beforeEach(() => {
    info.mockClear();
    warn.mockClear();
  });

  it("should find packages", async () => {
    await expect(
      findPackages(
        {
          cwd,
          logger,
          repositoryRoot: cwd,
          packageOptions: { paths: ["packages/*"] },
          setPluginPackageContext: vi.fn(),
        } as unknown as FindPackagesContext,
        {},
      ),
    ).resolves.toEqual([
      {
        name: pkgA.name,
        path: path.resolve(cwd, "packages", "a"),
      },
      {
        name: pkgB.name,
        path: path.resolve(cwd, "packages", "b"),
      },
    ]);

    expect(info).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
