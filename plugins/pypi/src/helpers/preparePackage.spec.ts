import { $ } from "execa";

import { PrepareContext } from "@lets-release/config";

import { preparePackage } from "src/helpers/preparePackage";
import { readTomlFile } from "src/helpers/toml/readTomlFile";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("node:fs/promises");
vi.mock("execa");
vi.mock("smol-toml");
vi.mock("src/helpers/toml/readTomlFile");

const version = "2.0.0";
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
        nextRelease: {
          version,
        },
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

  describe("uv", () => {
    beforeEach(() => {
      vi.mocked($).mockReset();
    });

    it("should prepare package if uv version command is successful (uv>0.7.0)", async () => {
      const successPromise = new ExtendedPromise((resolve) => {
        resolve({ stdout: ["pkg 1.0.0 => 2.0.0"] });
      });
      vi.mocked($).mockReturnValue((() => successPromise) as never);

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
          nextRelease: {
            version,
          },
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

    it("should handle uv version command with unexpected output format", async () => {
      const unexpectedPromise = new ExtendedPromise((resolve) => {
        resolve({ stdout: ["unexpected output format"] });
      });
      vi.mocked($)
        .mockReturnValueOnce((() => unexpectedPromise) as never)
        .mockReturnValue((() => promise) as never);

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
          nextRelease: {
            version,
          },
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

    it("should prepare package if uv version command fails with argument error", async () => {
      const error = new Error(`error: unexpected argument '${version}' found`);

      vi.mocked($)
        .mockReturnValueOnce(
          (() =>
            new ExtendedPromise((resolve, reject) => {
              reject(error);
            })) as never,
        )
        .mockReturnValue((() => promise) as never);

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
          nextRelease: {
            version,
          },
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

    it("should throw error if uv version command fails with other errors", async () => {
      const error = new Error(`error: unknown error`);

      vi.mocked($).mockReturnValue(
        (() =>
          new ExtendedPromise((resolve, reject) => {
            reject(error);
          })) as never,
      );

      await expect(
        preparePackage(
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
            nextRelease: {
              version,
            },
          } as unknown as PrepareContext,
          { pm: { name: "uv", version: "1", root: cwd } } as PyPIPackageContext,
          { distDir: "dist" },
        ),
      ).rejects.toThrow(error);
    });
  });
});
