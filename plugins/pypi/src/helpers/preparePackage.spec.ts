import { $ } from "execa";

import { PrepareContext } from "@lets-release/config";

import { preparePackage } from "src/helpers/preparePackage";
import { readTomlFile } from "src/helpers/toml/readTomlFile";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("node:fs/promises");
vi.mock("execa");
vi.mock("smol-toml");
vi.mock("src/helpers/toml/readTomlFile");

const cwd = "/path/cwd";
const log = vi.fn();
const logger = { log };
const setPluginPackageContext = vi.fn();

class ExtendedPromise extends Promise<unknown> {
  stdout = {
    pipe: vi.fn(),
  };
  stderr = {
    pipe: vi.fn(),
  };
}
const promise = new ExtendedPromise((resolve) => {
  resolve({ stdout: [""] });
});

vi.mocked(readTomlFile).mockResolvedValue({ project: {} });

describe("preparePackage", () => {
  beforeEach(() => {
    log.mockClear();
    setPluginPackageContext.mockClear();
    vi.mocked($)
      .mockReset()
      .mockReturnValue((() => promise) as never);
  });

  it("should prepare package for poetry", async () => {
    await preparePackage(
      {
        cwd,
        logger,
        setPluginPackageContext,
        repositoryRoot: "/root",
        package: {
          path: "/root/a",
          type: "pypi",
          name: "pkg",
          uniqueName: "pypi/pkg",
        },
        nextRelease: {},
      } as unknown as PrepareContext,
      { pm: { name: "poetry", version: "1", root: cwd } } as PyPIPackageContext,
      { distDir: "dist" },
    );

    expect(log).toHaveBeenCalledTimes(2);
    expect(setPluginPackageContext).toHaveBeenCalledWith(
      expect.objectContaining({
        prepared: true,
      }),
    );
  });

  it("should prepare package for uv", async () => {
    await preparePackage(
      {
        cwd,
        logger,
        setPluginPackageContext,
        repositoryRoot: "/root",
        package: {
          path: "/root/a",
          type: "pypi",
          name: "pkg",
          uniqueName: "pypi/pkg",
        },
        nextRelease: {},
      } as unknown as PrepareContext,
      { pm: { name: "uv", version: "1", root: cwd } } as PyPIPackageContext,
      { distDir: "dist" },
    );

    expect(log).toHaveBeenCalledTimes(2);
    expect(setPluginPackageContext).toHaveBeenCalledWith(
      expect.objectContaining({
        prepared: true,
      }),
    );
  });
});
