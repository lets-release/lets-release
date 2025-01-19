import { $ } from "execa";
import { NormalizedPackageJson } from "read-pkg";

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
        { publishConfig: { registry } } as NormalizedPackageJson,
        { cwd } as NpmPackageContext,
      ),
    ).resolves.toBe(registry);
    expect(vi.mocked($)).not.toHaveBeenCalled();
  });

  it("should get registry with pnpm", async () => {
    await expect(
      getRegistry(
        {} as VerifyConditionsContext,
        { name } as NormalizedPackageJson,
        { pm: { name: "pnpm", version: "9.0.0" }, cwd } as NpmPackageContext,
      ),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(1);
  });

  it("should get scoped registry with pnpm", async () => {
    await expect(
      getRegistry(
        {} as VerifyConditionsContext,
        { name } as NormalizedPackageJson,
        {
          pm: { name: "pnpm", version: "9.0.0" },
          cwd,
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
        { name } as NormalizedPackageJson,
        {
          pm: { name: "yarn", version: "4.0.0" },
          cwd,
        } as NpmPackageContext,
      ),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(1);
  });

  it("should get scoped registry with yarn", async () => {
    await expect(
      getRegistry(
        {} as VerifyConditionsContext,
        { name } as NormalizedPackageJson,
        {
          pm: { name: "yarn", version: "4.0.0" },
          cwd,
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
        { name } as NormalizedPackageJson,
        { cwd } as NpmPackageContext,
      ),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(1);
  });

  it("should get scoped registry with npm", async () => {
    await expect(
      getRegistry(
        {} as VerifyConditionsContext,
        { name } as NormalizedPackageJson,
        { cwd, scope: "@scope" } as NpmPackageContext,
      ),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(2);
  });
});
