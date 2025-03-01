import { AnalyzeCommitsContext } from "@lets-release/config";

import { UnsupportedNpmPackageManagerError } from "src/errors/UnsupportedNpmPackageManagerError";
import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { getNpmPackageContext } from "src/helpers/getNpmPackageContext";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("src/helpers/getNpmPackageContext");
vi.mock("src/helpers/verifyAuth");
vi.mock("src/helpers/verifyNpmPackageManagerVersion");

const env = {};
const repositoryRoot = "/root";
const pkg = {
  path: "/root/path",
  uniqueName: "npm/pkg",
};
const getPluginPackageContext = vi.fn();
const setPluginPackageContext = vi.fn();
const context = {
  env,
  repositoryRoot,
  package: pkg,
  getPluginPackageContext,
  setPluginPackageContext,
} as unknown as Pick<
  AnalyzeCommitsContext,
  | "env"
  | "repositoryRoot"
  | "package"
  | "getPluginPackageContext"
  | "setPluginPackageContext"
>;
const pkgContext = {
  pm: {
    name: "npm",
    version: "7.0.0",
    root: "/path/to/pkg/cwd",
  },
  pkg,
} as unknown as NpmPackageContext;

describe("ensureNpmPackageContext", () => {
  beforeEach(() => {
    vi.mocked(getNpmPackageContext).mockReset();
    getPluginPackageContext.mockReset();
    setPluginPackageContext.mockClear();
  });

  it("should throw error if the package context is not found", async () => {
    await expect(ensureNpmPackageContext(context, {})).rejects.toThrow(
      UnsupportedNpmPackageManagerError,
    );
  });

  it("should return the existing package context", async () => {
    getPluginPackageContext.mockReturnValue(pkgContext);

    await expect(ensureNpmPackageContext(context, {})).resolves.toEqual({
      ...pkgContext,
      verified: true,
    });
    expect(setPluginPackageContext).toHaveBeenNthCalledWith(1, {
      ...pkgContext,
      verified: true,
    });
  });

  it("should return new package context", async () => {
    vi.mocked(getNpmPackageContext).mockResolvedValue(pkgContext);

    await expect(ensureNpmPackageContext(context, {})).resolves.toEqual({
      ...pkgContext,
      verified: true,
    });
    expect(setPluginPackageContext).toHaveBeenNthCalledWith(1, {
      ...pkgContext,
      verified: true,
    });
  });
});
