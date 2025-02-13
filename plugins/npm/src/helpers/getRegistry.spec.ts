import { $ } from "execa";

import { VerifyConditionsContext } from "@lets-release/config";

import { DEFAULT_NPM_REGISTRY } from "src/constants/DEFAULT_NPM_REGISTRY";
import { getRegistry } from "src/helpers/getRegistry";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("execa");

const cwd = "cwd";
const registry = "https://test.org";
const scope = "@scope";
const name = `${scope}/name`;
const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("getRegistry", () => {
  beforeEach(() => {
    vi.mocked($).mockClear();
    exec
      .mockReset()
      .mockResolvedValueOnce({ stdout: "undefined" })
      .mockResolvedValueOnce({
        stdout: "",
      });
  });

  it("should get registry from package.json", async () => {
    await expect(
      getRegistry(
        {} as VerifyConditionsContext,
        {
          pm: { root: cwd },
          pkg: { publishConfig: { registry } },
        } as NpmPackageContext,
      ),
    ).resolves.toBe(registry);
    expect(vi.mocked($)).not.toHaveBeenCalled();
  });

  it("should get registry with pnpm", async () => {
    await expect(
      getRegistry(
        {} as VerifyConditionsContext,
        {
          pm: { name: "pnpm", version: "9.0.0", root: cwd },
          pkg: { name },
        } as NpmPackageContext,
      ),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(1);
  });

  it("should get scoped registry with pnpm", async () => {
    await expect(
      getRegistry(
        {} as VerifyConditionsContext,
        {
          pm: { name: "pnpm", version: "9.0.0", root: cwd },
          pkg: { name },
          scope: "@scope",
        } as NpmPackageContext,
      ),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(2);
  });

  it("should get registry with yarn", async () => {
    await expect(
      getRegistry(
        {} as VerifyConditionsContext,
        {
          pm: { name: "yarn", version: "4.0.0", root: cwd },
          pkg: { name },
        } as NpmPackageContext,
      ),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(1);
  });

  it("should get scoped registry with yarn", async () => {
    await expect(
      getRegistry(
        {} as VerifyConditionsContext,
        {
          pm: { name: "yarn", version: "4.0.0", root: cwd },
          pkg: { name },
          scope: "@scope",
        } as NpmPackageContext,
      ),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(2);
  });

  it("should get registry with npm", async () => {
    await expect(
      getRegistry(
        {} as VerifyConditionsContext,
        {
          pm: { root: cwd },
          pkg: { name },
        } as NpmPackageContext,
      ),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(1);
  });

  it("should get scoped registry with npm", async () => {
    await expect(
      getRegistry(
        {} as VerifyConditionsContext,
        {
          pm: { root: cwd },
          pkg: { name },
          scope: "@scope",
        } as NpmPackageContext,
      ),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(2);
  });
});
