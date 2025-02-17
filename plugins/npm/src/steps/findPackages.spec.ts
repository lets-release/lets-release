import path from "node:path";

import { globbySync } from "globby";

import { FindPackagesContext, PackageInfo } from "@lets-release/config";

import { NoPackageError } from "src/errors/NoPackageError";
import { getNpmPackageContext } from "src/helpers/getNpmPackageContext";
import { findPackages } from "src/steps/findPackages";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("globby");
vi.mock("src/helpers/getNpmPackageContext");

const repositoryRoot = "/root";
const folders = ["a", "b", "c"];
const name = "test";

const info = vi.fn();
const warn = vi.fn();

vi.mocked(globbySync).mockReturnValue(folders);

describe("findPackages", () => {
  beforeEach(() => {
    vi.mocked(globbySync).mockClear();
    vi.mocked(getNpmPackageContext).mockReset();
  });

  it("should find packages", async () => {
    vi.mocked(getNpmPackageContext).mockImplementation(
      async ({
        package: { path: pkgRoot },
      }: Pick<FindPackagesContext, "env" | "repositoryRoot"> & {
        package: Pick<PackageInfo, "path">;
      }) => {
        if (pkgRoot === path.resolve(repositoryRoot, "a")) {
          return { pkg: { name } } as unknown as NpmPackageContext;
        }

        if (pkgRoot === path.resolve(repositoryRoot, "b")) {
          return;
        }

        throw new AggregateError([new NoPackageError()], "AggregateError");
      },
    );

    await expect(
      findPackages(
        {
          logger: { info, warn },
          repositoryRoot,
          packageOptions: { paths: ["packages/*", ["apps/*"]] },
          setPluginPackageContext: vi.fn(),
        } as unknown as FindPackagesContext,
        {},
      ),
    ).resolves.toEqual([{ name, path: path.resolve(repositoryRoot, "a") }]);
    expect(globbySync).toHaveBeenCalledTimes(2);
    expect(vi.mocked(getNpmPackageContext)).toHaveBeenCalledTimes(3);
    expect(info).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
