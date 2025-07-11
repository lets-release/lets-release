import path from "node:path";

import { globSync } from "tinyglobby";

import { FindPackagesContext, PackageInfo } from "@lets-release/config";

import { NPM_PACKAGE_TYPE } from "src/constants/NPM_PACKAGE_TYPE";
import { NoNpmPackageError } from "src/errors/NoNpmPackageError";
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
const ctxWithFormerName = {
  pkg: {
    name: "test-pkg",
    "lets-release": {
      formerName: "old-pkg-name",
    },
  },
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

  if (name === "test-pkg") {
    return ctxWithFormerName;
  }
});
const setPluginPackageContext = vi.fn();

vi.mocked(globSync).mockReturnValue(folders);
vi.mocked(getNpmPackageContext).mockImplementation(
  async ({
    package: { path: pkgRoot },
  }: Pick<FindPackagesContext, "env"> & {
    package: Pick<PackageInfo, "path">;
    // eslint-disable-next-line @typescript-eslint/require-await
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

    if (pkgRoot === path.resolve(repositoryRoot, "d")) {
      return ctxWithFormerName;
    }

    throw new AggregateError([new NoNpmPackageError()], "AggregateError");
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
      {
        path: path.resolve(repositoryRoot, "d"),
        type: NPM_PACKAGE_TYPE,
        name: "test-pkg",
        dependencies: [],
        formerName: "old-pkg-name",
      },
    ]);
    expect(globSync).toHaveBeenCalledTimes(2);
    expect(vi.mocked(getNpmPackageContext)).toHaveBeenCalledTimes(4);
    expect(info).toHaveBeenCalledTimes(3);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("should handle package processing errors gracefully", async () => {
    const errorPackage = "error-pkg";
    vi.mocked(globSync).mockReturnValueOnce([errorPackage]);
    vi.mocked(getNpmPackageContext).mockRejectedValueOnce(
      new Error("Failed to process package"),
    );

    await expect(
      findPackages(
        {
          logger: { info, warn },
          repositoryRoot,
          packageOptions: { paths: ["packages/*"] },
          getPluginPackageContext,
          setPluginPackageContext,
        } as unknown as FindPackagesContext,
        {},
      ),
    ).resolves.toEqual([]);

    expect(warn).toHaveBeenCalledWith(
      `Skipping package at ${path.resolve(repositoryRoot, errorPackage)}: Failed to process package`,
    );
  });
});
