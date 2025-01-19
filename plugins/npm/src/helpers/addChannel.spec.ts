import { $ } from "execa";

import { VerifyReleaseContext } from "@lets-release/config";

import { addChannel } from "src/helpers/addChannel";
import { getDistTagVersion } from "src/helpers/getDistTagVersion";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("execa");
vi.mock("src/helpers/getDistTagVersion");

const log = vi.fn();
const warn = vi.fn();
const context = {
  cwd: "/path/to/cwd",
  env: {},
  stdout: process.stdout,
  stderr: process.stderr,
  logger: { log, warn },
  package: { name: "test" },
};
const pkgContext = {
  cwd: "/path/to/pkg/cwd",
  registry: "https://registry.npmjs.org",
};

class ExtendedPromise extends Promise<unknown> {
  stdout = {
    pipe: vi.fn(),
  };
  stderr = {
    pipe: vi.fn(),
  };
}

const promise = new ExtendedPromise((resolve) => {
  resolve(true);
});

vi.mocked($).mockReturnValue((() => promise) as never);

describe("addChannel", () => {
  beforeEach(() => {
    log.mockClear();
    warn.mockClear();
    vi.mocked($).mockClear();
    vi.mocked(getDistTagVersion).mockReset();
  });

  it("should skip add channel if the current version is less than the version on dist-tag", async () => {
    vi.mocked(getDistTagVersion).mockResolvedValue("2.0.0");

    await expect(
      addChannel(
        {
          ...context,
          nextRelease: { version: "1.0.0" },
        } as unknown as VerifyReleaseContext,
        pkgContext as NpmPackageContext,
        "latest",
      ),
    ).resolves.toBeUndefined();

    expect($).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("should skip add channel if the current version is equal to the version on dist-tag", async () => {
    vi.mocked(getDistTagVersion).mockResolvedValue("1.0.0");

    await expect(
      addChannel(
        {
          ...context,
          nextRelease: { version: "1.0.0" },
        } as unknown as VerifyReleaseContext,
        pkgContext as NpmPackageContext,
        "latest",
      ),
    ).resolves.toBeUndefined();

    expect($).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("should add channel if there is no version on dist-tag", async () => {
    vi.mocked(getDistTagVersion).mockResolvedValue(undefined);

    await expect(
      addChannel(
        {
          ...context,
          nextRelease: { version: "1.0.0" },
        } as unknown as VerifyReleaseContext,
        pkgContext as NpmPackageContext,
        "latest",
      ),
    ).resolves.toBeUndefined();

    expect($).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(2);
  });

  it("should add channel if the current version is greater than the version on dist-tag", async () => {
    vi.mocked(getDistTagVersion).mockResolvedValue("1.0.0");

    await expect(
      addChannel(
        {
          ...context,
          nextRelease: { version: "2.0.0" },
        } as unknown as VerifyReleaseContext,
        pkgContext as NpmPackageContext,
        "latest",
      ),
    ).resolves.toBeUndefined();

    expect($).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(2);
  });

  it("should add channel with pnpm", async () => {
    vi.mocked(getDistTagVersion).mockResolvedValue("1.0.0");

    await expect(
      addChannel(
        {
          ...context,
          nextRelease: { version: "2.0.0" },
        } as unknown as VerifyReleaseContext,
        { ...pkgContext, pm: { name: "pnpm" } } as NpmPackageContext,
        "latest",
      ),
    ).resolves.toBeUndefined();

    expect($).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(2);
  });

  it("should add channel with yarn", async () => {
    vi.mocked(getDistTagVersion).mockResolvedValue("1.0.0");

    await expect(
      addChannel(
        {
          ...context,
          nextRelease: { version: "2.0.0" },
        } as unknown as VerifyReleaseContext,
        { ...pkgContext, pm: { name: "yarn" } } as NpmPackageContext,
        "latest",
      ),
    ).resolves.toBeUndefined();

    expect($).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(2);
  });
});
