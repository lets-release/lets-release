import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { PrepareContext } from "@lets-release/config";

import { preparePackage } from "src/helpers/preparePackage";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("node:fs/promises");
vi.mock("execa");
vi.mock("strip-ansi");

const cwd = "/path/cwd";
const log = vi.fn();
const logger = { log };
const setPluginPackageContext = vi.fn();
const tgz = "test-1.0.0.tgz";

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

describe("preparePackage", () => {
  beforeEach(() => {
    log.mockClear();
    setPluginPackageContext.mockClear();
    vi.mocked($)
      .mockReset()
      .mockReturnValue((() => promise) as never);
    vi.mocked(stripAnsi)
      .mockReset()
      .mockImplementation((value) => value);
  });

  it("should prepare package without tarballDir", async () => {
    await expect(
      preparePackage(
        {
          logger,
          setPluginPackageContext,
          repositoryRoot: "/root",
          package: {
            path: "/root/a",
            type: "npm",
            name: "pkg",
            uniqueName: "npm/pkg",
          },
          nextRelease: {},
        } as unknown as PrepareContext,
        { pm: { name: "npm", root: cwd } } as NpmPackageContext,
        {},
      ),
    ).resolves.toBe(undefined);
    expect(log).toHaveBeenCalledTimes(1);
  });

  it("should prepare package with pnpm < 10.11.0", async () => {
    const promise = new ExtendedPromise((resolve) => {
      resolve({
        stdout: [tgz],
      });
    });
    vi.mocked($).mockReturnValue((() => promise) as never);

    await expect(
      preparePackage(
        {
          cwd,
          logger,
          setPluginPackageContext,
          repositoryRoot: "/root",
          package: {
            path: "/root/a",
            type: "npm",
            name: "pkg",
            uniqueName: "npm/pkg",
          },
          nextRelease: {},
        } as unknown as PrepareContext,
        {
          pm: {
            name: "pnpm",
            version: "10.10.0",
            root: cwd,
          },
        } as NpmPackageContext,
        { tarballDir: "b" },
      ),
    ).resolves.toBe(undefined);

    expect(log).toHaveBeenCalledTimes(2);
  });

  it("should prepare package with pnpm >= 10.11.0", async () => {
    const promise = new ExtendedPromise((resolve) => {
      resolve({
        stdout: [tgz],
      });
    });
    vi.mocked($).mockReturnValue((() => promise) as never);

    await expect(
      preparePackage(
        {
          cwd,
          logger,
          setPluginPackageContext,
          repositoryRoot: "/root",
          package: {
            path: "/root/a",
            type: "npm",
            name: "pkg",
            uniqueName: "npm/pkg",
          },
          nextRelease: {},
        } as unknown as PrepareContext,
        {
          pm: {
            name: "pnpm",
            version: "10.11.0",
            root: cwd,
          },
        } as NpmPackageContext,
        { tarballDir: "b" },
      ),
    ).resolves.toBe(undefined);

    expect(log).toHaveBeenCalledTimes(2);
  });

  it("should prepare package with yarn", async () => {
    const promise = new ExtendedPromise((resolve) => {
      resolve({
        stdout: [
          `{"base":"/root/a"}`,
          `{"location":"README.md"}`,
          "invalid json",
          "",
          `{"output":"/root/a/${tgz}"}`,
        ],
      });
    });
    vi.mocked($)
      .mockReset()
      .mockReturnValue((() => promise) as never);

    await expect(
      preparePackage(
        {
          logger,
          setPluginPackageContext,
          repositoryRoot: "/root",
          package: {
            path: "/root/a",
            type: "npm",
            name: "pkg",
            uniqueName: "npm/pkg",
          },
          nextRelease: {},
        } as unknown as PrepareContext,
        {
          pm: {
            name: "yarn",
            version: "1",
            root: cwd,
          },
        } as NpmPackageContext,
        { tarballDir: "b" },
      ),
    ).resolves.toBe(undefined);

    expect(log).toHaveBeenCalledTimes(2);
  });

  it("should prepare package with npm", async () => {
    const promise = new ExtendedPromise((resolve) => {
      resolve({
        stdout: [tgz],
      });
    });
    vi.mocked($)
      .mockReset()
      .mockReturnValue((() => promise) as never);

    await expect(
      preparePackage(
        {
          cwd,
          logger,
          setPluginPackageContext,
          repositoryRoot: "/root",
          package: {
            path: "/root/a",
            type: "npm",
            name: "pkg",
            uniqueName: "npm/pkg",
          },
          nextRelease: {},
        } as unknown as PrepareContext,
        {
          pm: { name: "npm", root: cwd },
        } as NpmPackageContext,
        { tarballDir: "b" },
      ),
    ).resolves.toBe(undefined);

    expect(log).toHaveBeenCalledTimes(2);
  });
});
