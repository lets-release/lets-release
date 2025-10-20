import { AnalyzeCommitsContext } from "@lets-release/config";

import { UnsupportedNpmPackageManagerError } from "src/errors/UnsupportedNpmPackageManagerError";
import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { getNpmPackageContext } from "src/helpers/getNpmPackageContext";
import { verifyNpmPackageManagerVersion } from "src/helpers/verifyNpmPackageManagerVersion";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("src/helpers/getNpmPackageContext");
vi.mock("src/helpers/verifyAuth");
vi.mock("src/helpers/verifyNpmPackageManagerVersion");

const ciEnv = { name: "GitHub Actions" };
const env = {};
const logger = {
  info: vi.fn(),
  warn: vi.fn(),
};
const repositoryRoot = "/root";
const pkg = {
  path: "/root/path",
  uniqueName: "npm/pkg",
};
const getPluginPackageContext = vi.fn();
const setPluginPackageContext = vi.fn();
const context = {
  ciEnv,
  env,
  logger,
  repositoryRoot,
  package: pkg,
  getPluginPackageContext,
  setPluginPackageContext,
} as unknown as Pick<
  AnalyzeCommitsContext,
  | "ciEnv"
  | "env"
  | "logger"
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
    vi.mocked(verifyNpmPackageManagerVersion).mockResolvedValue("10.11.0");

    await expect(ensureNpmPackageContext(context, {})).resolves.toEqual({
      ...pkgContext,
      pm: {
        ...pkgContext.pm,
        version: "10.11.0",
      },
      verified: true,
    });
    expect(setPluginPackageContext).toHaveBeenNthCalledWith(1, {
      ...pkgContext,
      pm: {
        ...pkgContext.pm,
        version: "10.11.0",
      },
      verified: true,
    });
  });
});
