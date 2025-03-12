import { mkdir, writeFile } from "node:fs/promises";
import { platform } from "node:os";
import path from "node:path";

import { $ } from "execa";
import { stringify } from "smol-toml";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { FindPackagesContext } from "@lets-release/config";

import { PYPI_PACKAGE_TYPE } from "src/constants/PYPI_PACKAGE_TYPE";
import { findPackages } from "src/steps/findPackages";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

const binDir = inject("binDir");
const UV_BIN_HOME = path.resolve(binDir, "uv", "latest");
const PATH = `${UV_BIN_HOME}${platform() === "win32" ? ";" : ":"}${process.env.PATH}`;
const env = {
  ...process.env,
  PATH,
  Path: PATH,
};
const cwd = temporaryDirectory();
const info = vi.fn();
const warn = vi.fn();
const logger = { info, warn };
const pkgA = {
  project: {
    name: "find-packages-a",
    version: "0.0.1",
  },
};
const pkgB = {
  project: {
    name: "find-packages-b",
    version: "0.0.1",
  },
};

describe("findPackages", () => {
  beforeAll(async () => {
    await mkdir(path.resolve(cwd, "packages", "a"), { recursive: true });
    await writeFile(
      path.resolve(cwd, "packages", "a", "pyproject.toml"),
      stringify(pkgA),
    );
    await $({ cwd: path.resolve(cwd, "packages", "a"), env })`uv sync`;
    await mkdir(path.resolve(cwd, "packages", "b"), { recursive: true });
    await writeFile(
      path.resolve(cwd, "packages", "b", "pyproject.toml"),
      stringify(pkgB),
    );
    await $({ cwd: path.resolve(cwd, "packages", "b"), env })`uv sync`;
    await mkdir(path.resolve(cwd, "packages", "c"), { recursive: true });
    await writeFile(
      path.resolve(cwd, "packages", "c", "pyproject.toml"),
      stringify({
        project: { name: "find-packages-c" },
      }),
    );
    await mkdir(path.resolve(cwd, "packages", "d"), { recursive: true });
  });

  beforeEach(() => {
    info.mockClear();
    warn.mockClear();
  });

  it("should find packages", async () => {
    const contexts: Record<string, PyPIPackageContext> = {};
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
          env,
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
        type: PYPI_PACKAGE_TYPE,
        name: pkgA.project.name,
        dependencies: [],
      },
      {
        path: path.resolve(cwd, "packages", "b"),
        type: PYPI_PACKAGE_TYPE,
        name: pkgB.project.name,
        dependencies: [],
      },
    ]);

    expect(info).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
