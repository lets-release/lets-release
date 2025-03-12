import { existsSync } from "node:fs";
import { platform } from "node:os";

import { getUvConfig } from "src/helpers/getUvConfig";
import { normalizePyProjectToml } from "src/helpers/normalizePyProjectToml";
import { normalizeUv } from "src/helpers/toml/normalizeUv";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("node:fs");
vi.mock("node:os");
vi.mock("src/helpers/toml/normalizeUv");
vi.mock("src/helpers/normalizePyProjectToml");
vi.mock("src/helpers/toml/readTomlFile");

const env = {
  APPDATA: "/appdata",
  XDG_CONFIG_HOME: "/xdg_config_home",
  XDG_CONFIG_DIRS: "/xdg_config_dirs",
  HOME: "/home",
  SYSTEMDRIVE: "C:",
};
const pkgRoot = "/workspace/pkg";
const workspaceRoot = "/workspace";
const uv = {
  index: [
    {
      name: "index1",
      publishUrl: "publishUrl1",
    },
  ],
  checkUrl: "checkUrl1",
  publishUrl: "publishUrl1",
  devDependencies: ["dep1"],
};

describe("getUvConfig", () => {
  beforeEach(() => {
    vi.mocked(platform).mockReset();
    vi.mocked(existsSync).mockReset();
    vi.mocked(normalizeUv).mockReset().mockReturnValue(uv);
    vi.mocked(normalizePyProjectToml).mockReturnValue({
      project: { name: "test" },
      tool: { uv },
    });
  });

  it("should return config from project level uv.toml", async () => {
    vi.mocked(existsSync).mockReturnValueOnce(true);

    const config = await getUvConfig({ env, package: { path: pkgRoot } }, {
      pm: { root: workspaceRoot },
      pkg: {},
    } as PyPIPackageContext);

    expect(config).toEqual(uv);
  });

  it("should return config from project pyproject.toml", async () => {
    const config = await getUvConfig(
      { env, package: { path: workspaceRoot } },
      {
        pm: { root: workspaceRoot },
        pkg: { tool: { uv } },
      } as PyPIPackageContext,
    );

    expect(config).toEqual(uv);
  });

  it("should return config from workspace root pyproject.toml", async () => {
    vi.mocked(existsSync).mockReturnValueOnce(false).mockReturnValueOnce(true);

    const config = await getUvConfig({ env, package: { path: pkgRoot } }, {
      pm: { root: workspaceRoot },
      pkg: {},
    } as PyPIPackageContext);

    expect(config).toEqual(uv);
  });

  it("should return config from user level uv.toml for windows", async () => {
    vi.mocked(platform).mockReturnValue("win32");
    vi.mocked(existsSync)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const config = await getUvConfig(
      {
        env: {
          ...env,
          SYSTEMDRIVE: undefined,
        },
        package: { path: pkgRoot },
      },
      {
        pm: { root: workspaceRoot },
        pkg: {},
      } as PyPIPackageContext,
    );

    expect(config).toEqual(uv);
  });

  it("should return config from user level uv.toml for other platforms", async () => {
    vi.mocked(existsSync)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const config = await getUvConfig(
      {
        env: {
          ...env,
          HOME: undefined,
        },
        package: { path: pkgRoot },
      },
      {
        pm: { root: workspaceRoot },
        pkg: {},
      } as PyPIPackageContext,
    );

    expect(config).toEqual(uv);
  });

  it("should return config from user level alternative uv.toml for other platforms", async () => {
    vi.mocked(existsSync)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const config = await getUvConfig(
      { env: { HOME: env.HOME }, package: { path: pkgRoot } },
      {
        pm: { root: workspaceRoot },
        pkg: {},
      } as PyPIPackageContext,
    );

    expect(config).toEqual(uv);
  });

  it("should return config from system level uv.toml for windows", async () => {
    vi.mocked(platform).mockReturnValue("win32");
    vi.mocked(existsSync)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const config = await getUvConfig({ env, package: { path: pkgRoot } }, {
      pm: { root: workspaceRoot },
      pkg: {},
    } as PyPIPackageContext);

    expect(config).toEqual(uv);
  });

  it("should return config from system level uv.toml for other platforms", async () => {
    vi.mocked(existsSync)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const config = await getUvConfig({ env, package: { path: pkgRoot } }, {
      pm: { root: workspaceRoot },
      pkg: {},
    } as PyPIPackageContext);

    expect(config).toEqual(uv);
  });

  it("should return config from system level alternative uv.toml for other platforms", async () => {
    vi.mocked(existsSync)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const config = await getUvConfig({ env, package: { path: pkgRoot } }, {
      pm: { root: workspaceRoot },
      pkg: {},
    } as PyPIPackageContext);

    expect(config).toEqual(uv);
  });
});
