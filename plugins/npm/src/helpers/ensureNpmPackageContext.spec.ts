import { findUp } from "find-up-simple";
// eslint-disable-next-line import-x/default
import preferredPM from "preferred-pm";
import { NormalizedPackageJson } from "read-pkg";

import {
  VerifyConditionsContext,
  VerifyReleaseContext,
} from "@lets-release/config";

import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { getRegistry } from "src/helpers/getRegistry";

vi.mock("find-up-simple");
vi.mock("preferred-pm");
vi.mock("src/helpers/getRegistry");
vi.mock("src/helpers/verifyAuth");

const registry = "https://test.org";

vi.mocked(getRegistry).mockResolvedValue(registry);

const repositoryRoot = "/root";
const pkg = {
  name: "pkg",
  path: "path",
};
const context = {
  pm: {
    name: "npm",
    version: "7.0.0",
  },
};
const getPluginPackageContext = vi.fn();
const setPluginPackageContext = vi.fn();

describe("ensureNpmPackageContext", () => {
  beforeEach(() => {
    vi.mocked(findUp).mockReset();
    vi.mocked(preferredPM).mockReset();
    getPluginPackageContext.mockReset();
    setPluginPackageContext.mockClear();
  });

  it("should return the existing context", async () => {
    getPluginPackageContext.mockReturnValue(context);

    await expect(
      ensureNpmPackageContext(
        {
          repositoryRoot,
          package: pkg,
          getPluginPackageContext,
          setPluginPackageContext,
        } as unknown as VerifyConditionsContext &
          Pick<VerifyReleaseContext, "package">,
        { name: "pkg" } as NormalizedPackageJson,
        {},
      ),
    ).resolves.toEqual(context);
    expect(getPluginPackageContext).toHaveBeenCalledTimes(1);
    expect(setPluginPackageContext).not.toHaveBeenCalled();
    expect(preferredPM).not.toHaveBeenCalled();
  });

  it("should create a new context with yarn", async () => {
    vi.mocked(preferredPM).mockResolvedValue({ name: "yarn", version: "1" });
    getPluginPackageContext.mockReturnValue(null);

    await expect(
      ensureNpmPackageContext(
        {
          repositoryRoot,
          package: pkg,
          getPluginPackageContext,
          setPluginPackageContext,
        } as unknown as VerifyConditionsContext &
          Pick<VerifyReleaseContext, "package">,
        { name: "pkg" } as NormalizedPackageJson,
        {},
      ),
    ).resolves.toEqual({
      pm: { name: "yarn", version: "1" },
      cwd: pkg.path,
      registry,
    });
    expect(vi.mocked(findUp)).toHaveBeenCalledTimes(2);
    expect(getPluginPackageContext).toHaveBeenCalledTimes(1);
    expect(setPluginPackageContext).toHaveBeenCalledTimes(1);
    expect(preferredPM).toHaveBeenCalledTimes(1);
    expect(preferredPM).toHaveBeenCalledWith(pkg.path);
  });

  it("should create a new context with other pm", async () => {
    getPluginPackageContext.mockReturnValue(null);
    vi.mocked(findUp).mockResolvedValue(`${pkg.path}/.npmrc`);

    await expect(
      ensureNpmPackageContext(
        {
          repositoryRoot,
          package: { ...pkg, name: "@scope/pkg" },
          getPluginPackageContext,
          setPluginPackageContext,
        } as unknown as VerifyConditionsContext &
          Pick<VerifyReleaseContext, "package">,
        { name: "@scope/pkg" } as NormalizedPackageJson,
        { skipPublishing: true },
      ),
    ).resolves.toEqual({
      pm: undefined,
      cwd: pkg.path,
      scope: "@scope",
      registry,
    });
    expect(vi.mocked(findUp)).toHaveBeenCalledTimes(1);
    expect(getPluginPackageContext).toHaveBeenCalledTimes(1);
    expect(setPluginPackageContext).toHaveBeenCalledTimes(1);
    expect(preferredPM).toHaveBeenCalledTimes(1);
    expect(preferredPM).toHaveBeenCalledWith(pkg.path);
  });
});
