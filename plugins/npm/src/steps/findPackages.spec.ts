import path from "node:path";

import { glob } from "glob";
import { NormalizedPackageJson } from "read-pkg";

import { FindPackagesContext } from "@lets-release/config";

import { NoPackageError } from "src/errors/NoPackageError";
import { getPackage } from "src/helpers/getPackage";
import { findPackages } from "src/steps/findPackages";

vi.mock("glob");
vi.mock("src/helpers/getPackage");

const repositoryRoot = "/root";
const folders = ["a", "b"];
const name = "test";

const info = vi.fn();
const warn = vi.fn();

vi.mocked(glob).mockResolvedValue(folders);

describe("findPackages", () => {
  beforeEach(() => {
    vi.mocked(glob).mockClear();
    vi.mocked(getPackage).mockReset();
  });

  it("should find packages", async () => {
    vi.mocked(getPackage).mockImplementation(async (pkgRoot: string) => {
      if (pkgRoot === path.resolve(repositoryRoot, "a")) {
        return { name } as unknown as NormalizedPackageJson;
      }

      throw new AggregateError([new NoPackageError()], "AggregateError");
    });

    await expect(
      findPackages(
        {
          logger: { info, warn },
          repositoryRoot,
          packageOptions: { paths: ["packages/*"] },
        } as unknown as FindPackagesContext,
        {},
      ),
    ).resolves.toEqual([{ name, path: path.resolve(repositoryRoot, "a") }]);
    expect(glob).toHaveBeenCalledTimes(1);
    expect(vi.mocked(getPackage)).toHaveBeenCalledTimes(2);
    expect(info).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledOnce();
  });
});
