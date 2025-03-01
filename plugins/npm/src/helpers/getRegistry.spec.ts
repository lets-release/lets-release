import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { DEFAULT_NPM_REGISTRY } from "src/constants/DEFAULT_NPM_REGISTRY";
import { getRegistry } from "src/helpers/getRegistry";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("execa");
vi.mock("strip-ansi");

const root = "/root";
const path = "/root/path";
const registry = "https://test.org";
const scope = "@scope";
const name = `${scope}/name`;
const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);
vi.mocked(stripAnsi).mockImplementation((value) => value);

describe("getRegistry", () => {
  beforeEach(() => {
    vi.mocked($).mockClear();
    exec
      .mockReset()
      .mockResolvedValueOnce({ stdout: "undefined" })
      .mockResolvedValueOnce({ stdout: "null" })
      .mockResolvedValue({
        stdout: "",
      });
  });

  it("should get registry from package.json", async () => {
    await expect(
      getRegistry({ env: {}, package: { path } }, {
        pm: { root },
        pkg: { publishConfig: { registry } },
      } as NpmPackageContext),
    ).resolves.toBe(registry);
    expect(vi.mocked($)).not.toHaveBeenCalled();
  });

  it("should get registry with pnpm", async () => {
    await expect(
      getRegistry({ env: {}, package: { path } }, {
        pm: { name: "pnpm", version: "9.0.0", root },
        pkg: { name },
      } as NpmPackageContext),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(2);
  });

  it("should get scoped registry with pnpm", async () => {
    await expect(
      getRegistry({ env: {}, package: { path } }, {
        pm: { name: "pnpm", version: "9.0.0", root },
        pkg: { name },
        scope: "@scope",
      } as NpmPackageContext),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(4);
  });

  it("should get registry with yarn", async () => {
    await expect(
      getRegistry({ env: {}, package: { path } }, {
        pm: { name: "yarn", version: "4.0.0", root },
        pkg: { name },
      } as NpmPackageContext),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(2);
  });

  it("should get scoped registry with yarn", async () => {
    await expect(
      getRegistry({ env: {}, package: { path } }, {
        pm: { name: "yarn", version: "4.0.0", root },
        pkg: { name },
        scope: "@scope",
      } as NpmPackageContext),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(4);
  });

  it("should get registry with npm", async () => {
    await expect(
      getRegistry({ env: {}, package: { path } }, {
        pm: { root },
        pkg: { name },
      } as NpmPackageContext),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(1);
  });

  it("should get scoped registry with npm", async () => {
    await expect(
      getRegistry({ env: {}, package: { path } }, {
        pm: { root },
        pkg: { name },
        scope: "@scope",
      } as NpmPackageContext),
    ).resolves.toBe(DEFAULT_NPM_REGISTRY);
    expect(vi.mocked($)).toHaveBeenCalledTimes(2);
  });
});
