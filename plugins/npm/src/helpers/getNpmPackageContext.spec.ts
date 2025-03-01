// eslint-disable-next-line import-x/default
import preferredPM from "preferred-pm";
import { NormalizedPackageJson } from "read-pkg";
import { resolveWorkspaceRoot } from "resolve-workspace-root";

import { getNpmPackageContext } from "src/helpers/getNpmPackageContext";
import { getPackage } from "src/helpers/getPackage";
import { getRegistry } from "src/helpers/getRegistry";

vi.mock("preferred-pm");
vi.mock("resolve-workspace-root");
vi.mock("src/helpers/getPackage");
vi.mock("src/helpers/getRegistry");

const registry = "https://test.org";
const env = {};
const pkg = {
  name: "pkg",
  path: "/root/path",
};

vi.mocked(getRegistry).mockResolvedValue(registry);

describe("getNpmPackageContext", () => {
  beforeEach(() => {
    vi.mocked(preferredPM).mockReset();
    vi.mocked(resolveWorkspaceRoot).mockReset();
    vi.mocked(getPackage).mockReset();
  });

  it("should return undefined if the package manager is not found", async () => {
    await expect(
      getNpmPackageContext({
        env,
        package: pkg,
      }),
    ).resolves.toBeUndefined();
  });

  it("should return undefined if the package manager is not supported", async () => {
    vi.mocked(preferredPM).mockResolvedValue({ name: "bun", version: "1" });

    await expect(
      getNpmPackageContext({
        env,
        package: pkg,
      }),
    ).resolves.toBeUndefined();
  });

  it("should get package context", async () => {
    vi.mocked(preferredPM).mockResolvedValue({ name: "pnpm", version: "1" });
    vi.mocked(getPackage).mockResolvedValue({
      name: "@scope/pkg",
    } as NormalizedPackageJson);

    await expect(
      getNpmPackageContext({
        env,
        package: pkg,
      }),
    ).resolves.toEqual({
      pm: { name: "pnpm", version: "1", root: pkg.path },
      pkg: {
        name: "@scope/pkg",
      },
      scope: "@scope",
      registry,
    });
  });

  it("should get package context in workspace", async () => {
    vi.mocked(preferredPM).mockResolvedValue({ name: "pnpm", version: "1" });
    vi.mocked(resolveWorkspaceRoot).mockReturnValue("/root");
    vi.mocked(getPackage).mockResolvedValue({
      name: "pkg",
    } as NormalizedPackageJson);

    await expect(
      getNpmPackageContext({
        env,
        package: pkg,
      }),
    ).resolves.toEqual({
      pm: { name: "pnpm", version: "1", root: "/root" },
      pkg: { name: "pkg" },
      scope: undefined,
      registry,
    });
  });
});
