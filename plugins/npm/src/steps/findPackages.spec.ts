import path from "node:path";

import { globSync } from "tinyglobby";

import { FindPackagesContext, PackageInfo } from "@lets-release/config";

import { NPM_PACKAGE_TYPE } from "src/constants/NPM_PACKAGE_TYPE";
import { NoPackageError } from "src/errors/NoPackageError";
import { getNpmPackageContext } from "src/helpers/getNpmPackageContext";
import { findPackages } from "src/steps/findPackages";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("tinyglobby");
vi.mock("src/helpers/getNpmPackageContext");

const repositoryRoot = "/root";
const folders = ["a", "b", "c", "d"];
const ctxA = {
  pkg: {
    name: "a",
    dependencies: {
      b: "1.0.0",
    },
  },
} as unknown as NpmPackageContext;
const ctxB = {
  pkg: { name: "b" },
} as unknown as NpmPackageContext;

const info = vi.fn();
const warn = vi.fn();
const getPluginPackageContext = vi.fn().mockImplementation((type, name) => {
  if (name === "a") {
    return ctxA;
  }

  if (name === "b") {
    return ctxB;
  }
});
const setPluginPackageContext = vi.fn();

vi.mocked(globSync).mockReturnValue(folders);
vi.mocked(getNpmPackageContext).mockImplementation(
  async ({
    package: { path: pkgRoot },
  }: Pick<FindPackagesContext, "env" | "repositoryRoot"> & {
    package: Pick<PackageInfo, "path">;
  }) => {
    if (pkgRoot === path.resolve(repositoryRoot, "a")) {
      return ctxA;
    }

    if (pkgRoot === path.resolve(repositoryRoot, "b")) {
      return ctxB;
    }

    if (pkgRoot === path.resolve(repositoryRoot, "c")) {
      return;
    }

    throw new AggregateError([new NoPackageError()], "AggregateError");
  },
);

describe("findPackages", () => {
  it("should find packages", async () => {
    await expect(
      findPackages(
        {
          logger: { info, warn },
          repositoryRoot,
          packageOptions: { paths: ["packages/*", ["apps/*"]] },
          getPluginPackageContext,
          setPluginPackageContext,
        } as unknown as FindPackagesContext,
        {},
      ),
    ).resolves.toEqual([
      {
        path: path.resolve(repositoryRoot, "a"),
        type: NPM_PACKAGE_TYPE,
        name: "a",
        dependencies: [
          {
            path: path.resolve(repositoryRoot, "b"),
            type: NPM_PACKAGE_TYPE,
            name: "b",
          },
        ],
      },
      {
        path: path.resolve(repositoryRoot, "b"),
        type: NPM_PACKAGE_TYPE,
        name: "b",
        dependencies: [],
      },
    ]);
    expect(globSync).toHaveBeenCalledTimes(2);
    expect(vi.mocked(getNpmPackageContext)).toHaveBeenCalledTimes(4);
    expect(info).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
