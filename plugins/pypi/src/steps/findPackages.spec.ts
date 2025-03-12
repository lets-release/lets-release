import path from "node:path";

import { globSync } from "tinyglobby";

import { FindPackagesContext } from "@lets-release/config";

import { PYPI_PACKAGE_TYPE } from "src/constants/PYPI_PACKAGE_TYPE";
import { getPyPIPackageContext } from "src/helpers/getPyPIPackageContext";
import { findPackages } from "src/steps/findPackages";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("tinyglobby");
vi.mock("src/helpers/getPyPIPackageContext");

const info = vi.fn();
const warn = vi.fn();
const getPluginPackageContext = vi.fn();
const setPluginPackageContext = vi.fn();
const context = {
  logger: { info, warn },
  repositoryRoot: "/repo",
  packageOptions: { paths: ["packages/*"] },
  getPluginPackageContext,
  setPluginPackageContext,
} as unknown as FindPackagesContext;
const options = {};

describe("findPackages", () => {
  beforeEach(() => {
    vi.mocked(globSync).mockReset();
    vi.mocked(getPyPIPackageContext).mockReset();
    getPluginPackageContext.mockReset().mockReturnValue({
      pkg: {
        project: {
          dependencies: ["dep1", " dep2"],
          optionalDependencies: { dev: ["opt1", " opt2"] },
        },
        dependencyGroups: { dev: ["group1", " group2"] },
        tool: {
          uv: {
            devDependencies: ["uv1", " uv2"],
          },
          poetry: {
            dependencies: { poetry1: "1.0.0", " poetry2": "2.0.0" },
            group: {
              poetryGroup1: {
                dependencies: {
                  poetryGroup1Dep1: "1.0.0",
                  " poetryGroup1Dep2": "2.0.0",
                },
              },
            },
          },
        },
      },
    });
  });

  it("should find and return packages", async () => {
    vi.mocked(globSync).mockReturnValue(["packages/pkg1", "packages/pkg2"]);
    vi.mocked(getPyPIPackageContext)
      .mockResolvedValueOnce({
        pkg: { project: { name: "pkg1" } },
      } as PyPIPackageContext)
      .mockResolvedValueOnce({
        pkg: { project: { name: "pkg2" } },
      } as PyPIPackageContext);

    const result = await findPackages(context, options);

    expect(result).toEqual([
      {
        path: path.resolve("/repo", "packages/pkg1"),
        type: PYPI_PACKAGE_TYPE,
        name: "pkg1",
        dependencies: [],
      },
      {
        path: path.resolve("/repo", "packages/pkg2"),
        type: PYPI_PACKAGE_TYPE,
        name: "pkg2",
        dependencies: [],
      },
    ]);
    expect(info).toHaveBeenCalledTimes(2);
    expect(setPluginPackageContext).toHaveBeenCalledTimes(2);
  });

  it("should skip unsupported packages", async () => {
    vi.mocked(globSync).mockReturnValue(["packages/pkg1"]);
    vi.mocked(getPyPIPackageContext).mockResolvedValue(undefined);

    const result = await findPackages(context, options);

    expect(result).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      `Skipping package at ${path.resolve("/repo", "packages/pkg1")}: Unsupported PyPI package manager`,
    );
  });

  it("should handle errors gracefully", async () => {
    vi.mocked(globSync).mockReturnValue(["packages/pkg1"]);
    vi.mocked(getPyPIPackageContext).mockRejectedValue(new Error("Test error"));

    const result = await findPackages(context, options);

    expect(result).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        `Skipping package at ${path.resolve("/repo", "packages/pkg1")}: Error: Test error`,
      ),
    );
  });
});
