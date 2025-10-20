import { getIDToken } from "@actions/core";
import debug from "debug";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { TrustedPublisher } from "src/enums/TrustedPublisher";
import { getTrustedPublisherIdToken } from "src/helpers/getTrustedPublisherIdToken";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("@actions/core");
vi.mock("debug");

const mockGetIDToken = vi.mocked(getIDToken);
const mockDebug = vi.fn();
vi.mocked(debug).mockReturnValue(mockDebug as unknown as debug.Debugger);

describe("getTrustedPublisherIdToken", () => {
  const registry = "https://registry.npmjs.org/";
  const uniqueName = "test-package";

  const logger = {
    warn: vi.fn(),
  };

  const npmPackageContext = {
    registry,
  } as Pick<NpmPackageContext, "registry">;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NPM_ID_TOKEN;
  });

  it("should return GitHub Actions OIDC token when successful", async () => {
    const expectedToken = "github-actions-token-12345";
    const context = {
      ciEnv: { name: TrustedPublisher.GITHUB_ACTIONS },
      logger,
      package: { uniqueName },
    } as unknown as Pick<AnalyzeCommitsContext, "ciEnv" | "logger" | "package">;

    mockGetIDToken.mockResolvedValue(expectedToken);

    const result = await getTrustedPublisherIdToken(context, npmPackageContext);

    expect(result).toBe(expectedToken);
    expect(mockGetIDToken).toHaveBeenCalledWith("npm:registry.npmjs.org");
    expect(logger.warn).not.toHaveBeenCalled();
    expect(mockDebug).not.toHaveBeenCalled();
  });

  it("should handle GitHub Actions OIDC token retrieval failure", async () => {
    const error = new Error("Failed to get ID token");
    const context = {
      ciEnv: { name: TrustedPublisher.GITHUB_ACTIONS },
      logger,
      package: { uniqueName },
    } as unknown as Pick<AnalyzeCommitsContext, "ciEnv" | "logger" | "package">;

    mockGetIDToken.mockRejectedValue(error);

    const result = await getTrustedPublisherIdToken(context, npmPackageContext);

    expect(result).toBeUndefined();
    expect(mockGetIDToken).toHaveBeenCalledWith("npm:registry.npmjs.org");
    expect(mockDebug).toHaveBeenCalledWith(error);
    expect(logger.warn).toHaveBeenCalledWith({
      prefix: `[${uniqueName}]`,
      message:
        "Failed to retrieve GitHub Actions OIDC token for https://registry.npmjs.org/",
    });
  });

  it("should return NPM_ID_TOKEN environment variable for GitLab CI/CD", async () => {
    const expectedToken = "gitlab-token-67890";
    process.env.NPM_ID_TOKEN = expectedToken;

    const context = {
      ciEnv: { name: TrustedPublisher.GITLAB_CI_CD_PIPELINES },
      logger,
      package: { uniqueName },
    } as unknown as Pick<AnalyzeCommitsContext, "ciEnv" | "logger" | "package">;

    const result = await getTrustedPublisherIdToken(context, npmPackageContext);

    expect(result).toBe(expectedToken);
    expect(mockGetIDToken).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(mockDebug).not.toHaveBeenCalled();
  });

  it("should return undefined for GitLab CI/CD when NPM_ID_TOKEN is not set", async () => {
    const context = {
      ciEnv: { name: TrustedPublisher.GITLAB_CI_CD_PIPELINES },
      logger,
      package: { uniqueName },
    } as unknown as Pick<AnalyzeCommitsContext, "ciEnv" | "logger" | "package">;

    const result = await getTrustedPublisherIdToken(context, npmPackageContext);

    expect(result).toBeUndefined();
    expect(mockGetIDToken).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(mockDebug).not.toHaveBeenCalled();
  });

  it("should handle unknown publisher by returning undefined", async () => {
    const context = {
      ciEnv: { name: "Unknown Publisher" },
      logger,
      package: { uniqueName },
    } as unknown as Pick<AnalyzeCommitsContext, "ciEnv" | "logger" | "package">;

    const result = await getTrustedPublisherIdToken(context, npmPackageContext);

    expect(result).toBeUndefined();
    expect(mockGetIDToken).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(mockDebug).not.toHaveBeenCalled();
  });

  it("should handle ciEnv without name property", async () => {
    const context = {
      ciEnv: {},
      logger,
      package: { uniqueName },
    } as unknown as Pick<AnalyzeCommitsContext, "ciEnv" | "logger" | "package">;

    const result = await getTrustedPublisherIdToken(context, npmPackageContext);

    expect(result).toBeUndefined();
    expect(mockGetIDToken).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(mockDebug).not.toHaveBeenCalled();
  });

  it("should handle different registry hosts correctly", async () => {
    const customRegistry = "https://npm.pkg.github.com/";
    const expectedToken = "custom-registry-token";
    const customNpmPackageContext = {
      registry: customRegistry,
    } as Pick<NpmPackageContext, "registry">;

    const context = {
      ciEnv: { name: TrustedPublisher.GITHUB_ACTIONS },
      logger,
      package: { uniqueName },
    } as unknown as Pick<AnalyzeCommitsContext, "ciEnv" | "logger" | "package">;

    mockGetIDToken.mockResolvedValue(expectedToken);

    const result = await getTrustedPublisherIdToken(
      context,
      customNpmPackageContext,
    );

    expect(result).toBe(expectedToken);
    expect(mockGetIDToken).toHaveBeenCalledWith("npm:npm.pkg.github.com");
  });

  it("should handle GitHub Actions with custom registry URL", async () => {
    const customRegistry = "https://custom-npm-registry.example.com:8080/";
    const expectedToken = "custom-registry-token";
    const customNpmPackageContext = {
      registry: customRegistry,
    } as Pick<NpmPackageContext, "registry">;

    const context = {
      ciEnv: { name: TrustedPublisher.GITHUB_ACTIONS },
      logger,
      package: { uniqueName },
    } as unknown as Pick<AnalyzeCommitsContext, "ciEnv" | "logger" | "package">;

    mockGetIDToken.mockResolvedValue(expectedToken);

    const result = await getTrustedPublisherIdToken(
      context,
      customNpmPackageContext,
    );

    expect(result).toBe(expectedToken);
    expect(mockGetIDToken).toHaveBeenCalledWith(
      "npm:custom-npm-registry.example.com:8080",
    );
  });
});
