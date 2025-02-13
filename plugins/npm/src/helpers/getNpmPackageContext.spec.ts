import path from "node:path";

import { findUp } from "find-up-simple";
// eslint-disable-next-line import-x/default
import preferredPM from "preferred-pm";
import { NormalizedPackageJson } from "read-pkg";

import { getNpmPackageContext } from "src/helpers/getNpmPackageContext";
import { getPackage } from "src/helpers/getPackage";
import { getRegistry } from "src/helpers/getRegistry";

vi.mock("find-up-simple");
vi.mock("preferred-pm");
vi.mock("src/helpers/getPackage");
vi.mock("src/helpers/getRegistry");

const registry = "https://test.org";
const env = {};
const repositoryRoot = "/root";
const pkg = {
  name: "pkg",
  path: "/root/path",
};

vi.mocked(getRegistry).mockResolvedValue(registry);

describe("getNpmPackageContext", () => {
  beforeEach(() => {
    vi.mocked(findUp).mockReset();
    vi.mocked(preferredPM).mockReset();
    vi.mocked(getPackage).mockReset();
  });

  it("should return undefined if the package manager is not found", async () => {
    await expect(
      getNpmPackageContext({
        env,
        repositoryRoot,
        package: pkg,
      }),
    ).resolves.toBeUndefined();
  });

  it("should return undefined if the package manager is not supported", async () => {
    vi.mocked(preferredPM).mockResolvedValue({ name: "bun", version: "1" });

    await expect(
      getNpmPackageContext({
        env,
        repositoryRoot,
        package: pkg,
      }),
    ).resolves.toBeUndefined();
  });

  it("should get package context with yarn", async () => {
    vi.mocked(preferredPM).mockResolvedValue({ name: "yarn", version: "1" });
    vi.mocked(getPackage).mockResolvedValue({
      name: "pkg",
    } as NormalizedPackageJson);

    await expect(
      getNpmPackageContext({
        env,
        repositoryRoot,
        package: pkg,
      }),
    ).resolves.toEqual({
      pm: { name: "yarn", version: "1", root: pkg.path },
      pkg: { name: "pkg" },
      scope: undefined,
      registry,
    });
    expect(vi.mocked(findUp)).toHaveBeenCalledTimes(2);
  });

  it("should get package context with other pm", async () => {
    vi.mocked(findUp).mockResolvedValue(path.resolve(pkg.path, ".npmrc"));
    vi.mocked(preferredPM).mockResolvedValue({ name: "npm", version: "1" });
    vi.mocked(getPackage).mockResolvedValue({
      name: "@scope/pkg",
    } as NormalizedPackageJson);

    await expect(
      getNpmPackageContext({
        env,
        repositoryRoot,
        package: pkg,
      }),
    ).resolves.toEqual({
      pm: { name: "npm", version: "1", root: pkg.path },
      pkg: {
        name: "@scope/pkg",
      },
      scope: "@scope",
      registry,
    });
    expect(vi.mocked(findUp)).toHaveBeenCalledTimes(1);
  });
});
