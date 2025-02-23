import { mkdir } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson } from "fs-extra";
import { temporaryDirectory } from "tempy";

import { FindPackagesContext } from "@lets-release/config";

import { NPM_PACKAGE_TYPE } from "src/constants/NPM_PACKAGE_TYPE";
import { findPackages } from "src/steps/findPackages";
import { NpmPackageContext } from "src/types/NpmPackageContext";

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
    const contexts: Record<string, NpmPackageContext> = {};
    const setPluginPackageContext = vi
      .fn()
      .mockImplementation((type, name, context) => {
        contexts[`${type}/${name}`] = context;
      });
    const getPluginPackageContext = vi.fn().mockImplementation((type, name) => {
      return contexts[`${type}/${name}`];
    });

    await expect(
      findPackages(
        {
          cwd,
          logger,
          repositoryRoot: cwd,
          packageOptions: { paths: ["packages/*"] },
          getPluginPackageContext,
          setPluginPackageContext,
        } as unknown as FindPackagesContext,
        {},
      ),
    ).resolves.toEqual([
      {
        path: path.resolve(cwd, "packages", "a"),
        type: NPM_PACKAGE_TYPE,
        name: pkgA.name,
        dependencies: [],
      },
      {
        path: path.resolve(cwd, "packages", "b"),
        type: NPM_PACKAGE_TYPE,
        name: pkgB.name,
        dependencies: [],
      },
    ]);

    expect(info).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
