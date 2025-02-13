import { $ } from "execa";

import { PrepareContext } from "@lets-release/config";

import { preparePackage } from "src/helpers/preparePackage";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const move = vi.hoisted(() => vi.fn());

vi.mock("node:fs/promises");
vi.mock("fs-extra", () => ({
  default: { move },
}));
vi.mock("execa");

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
  resolve({ stdout: "" });
});

describe("preparePackage", () => {
  beforeEach(() => {
    log.mockClear();
    setPluginPackageContext.mockClear();
    vi.mocked($)
      .mockReset()
      .mockReturnValue((() => promise) as never);
  });

  it("should prepare package without tarballDir", async () => {
    await expect(
      preparePackage(
        {
          logger,
          setPluginPackageContext,
          repositoryRoot: "/root",
          package: { path: "/root/a" },
          nextRelease: {},
        } as unknown as PrepareContext,
        { pm: { name: "npm", root: cwd } } as NpmPackageContext,
        {},
      ),
    ).resolves.toBe(undefined);
    expect(log).toHaveBeenCalledTimes(1);
  });

  it("should prepare package with pnpm", async () => {
    const promise = new ExtendedPromise((resolve) => {
      resolve({ stdout: tgz });
    });
    vi.mocked($).mockReturnValue((() => promise) as never);

    await expect(
      preparePackage(
        {
          cwd,
          logger,
          setPluginPackageContext,
          repositoryRoot: "/root",
          package: { path: "/root/a" },
          nextRelease: {},
        } as unknown as PrepareContext,
        {
          pm: {
            name: "pnpm",
            version: "1",
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
        stdout: `{"base":"/root/a"}
{"location":"README.md"}
{"output":"/root/a/${tgz}"}
`,
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
          package: { path: "/root/a" },
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
        stdout: `[
  {
    "id": "test@2.0.0",
    "name": "test",
    "version": "2.0.0",
    "filename": "${tgz}",
    "files": [
      "README.md"
    ],
    "entryCount": 11,
    "bundled": []
  }
]
`,
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
          package: { path: "/root/a" },
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
