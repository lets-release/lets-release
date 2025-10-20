import { getIDToken } from "@actions/core";
import debug from "debug";
import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { TrustedPublisher } from "src/enums/TrustedPublisher";
import { getTrustedPublisherIdToken } from "src/helpers/getTrustedPublisherIdToken";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

// Mock external dependencies
vi.mock("@actions/core");
vi.mock("debug");

const mockGetIDToken = vi.mocked(getIDToken);
const mockDebug = vi.fn();
vi.mocked(debug).mockReturnValue(mockDebug as unknown as debug.Debugger);

// Test data
const logger = {
  warn: vi.fn(),
};

const uniqueName = "pypi/test-package";
const registry = {
  publishUrl: "https://upload.pypi.org/simple/",
};

const baseContext = {
  ciEnv: { name: "GitHub Actions" },
  logger,
  package: { uniqueName },
} as unknown as Pick<AnalyzeCommitsContext, "ciEnv" | "logger" | "package">;

const pypiPackageContext = {
  registry,
} as Pick<PyPIPackageContext, "registry">;

describe("getTrustedPublisherIdToken", () => {
  let mockAgent: MockAgent;
  let mockPool: Interceptable;

  beforeEach(() => {
    mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);
    mockPool = mockAgent.get("https://upload.pypi.org");

    vi.clearAllMocks();
    delete process.env.NPM_ID_TOKEN;
  });

  afterEach(async () => {
    await mockAgent.close();
  });

  describe("OIDC audience fetch", () => {
    it("should return undefined when audience fetch fails", async () => {
      mockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(404);

      const result = await getTrustedPublisherIdToken(
        baseContext,
        pypiPackageContext,
      );

      expect(result).toBeUndefined();
      expect(mockGetIDToken).not.toHaveBeenCalled();
    });

    it("should return undefined when audience JSON parsing fails", async () => {
      mockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(200, "invalid json", {
          headers: { "Content-Type": "application/json" },
        });

      const result = await getTrustedPublisherIdToken(
        baseContext,
        pypiPackageContext,
      );

      expect(result).toBeUndefined();
      expect(mockGetIDToken).not.toHaveBeenCalled();
    });

    it("should return undefined when audience is not a string", async () => {
      mockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(
          200,
          { audience: 123 },
          { headers: { "Content-Type": "application/json" } },
        );

      const result = await getTrustedPublisherIdToken(
        baseContext,
        pypiPackageContext,
      );

      expect(result).toBeUndefined();
      expect(mockGetIDToken).not.toHaveBeenCalled();
    });

    it("should return undefined when audience is missing", async () => {
      mockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(200, {}, { headers: { "Content-Type": "application/json" } });

      const result = await getTrustedPublisherIdToken(
        baseContext,
        pypiPackageContext,
      );

      expect(result).toBeUndefined();
      expect(mockGetIDToken).not.toHaveBeenCalled();
    });

    it("should return undefined when audience is empty string", async () => {
      mockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(
          200,
          { audience: "" },
          { headers: { "Content-Type": "application/json" } },
        );

      const result = await getTrustedPublisherIdToken(
        baseContext,
        pypiPackageContext,
      );

      expect(result).toBeUndefined();
      expect(mockGetIDToken).not.toHaveBeenCalled();
    });
  });

  describe("GitHub Actions publisher", () => {
    it("should return ID token on successful GitHub Actions OIDC token retrieval", async () => {
      const expectedToken = "gha_test_token";
      const audience = "pypi";

      mockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(
          200,
          { audience },
          { headers: { "Content-Type": "application/json" } },
        );

      mockGetIDToken.mockResolvedValue(expectedToken);

      const result = await getTrustedPublisherIdToken(
        baseContext,
        pypiPackageContext,
      );

      expect(result).toBe(expectedToken);
      expect(mockGetIDToken).toHaveBeenCalledWith(audience);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should return undefined and log warning when GitHub Actions OIDC token retrieval fails", async () => {
      const audience = "pypi";
      const error = new Error("Failed to get OIDC token");

      mockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(
          200,
          { audience },
          { headers: { "Content-Type": "application/json" } },
        );

      mockGetIDToken.mockRejectedValue(error);

      const result = await getTrustedPublisherIdToken(
        baseContext,
        pypiPackageContext,
      );

      expect(result).toBeUndefined();
      expect(mockGetIDToken).toHaveBeenCalledWith(audience);
      expect(vi.mocked(debug)).toHaveBeenCalledWith(
        "@lets-release/pypi:pypi/test-package",
      );
      expect(mockDebug).toHaveBeenCalledWith(error);
      expect(logger.warn).toHaveBeenCalledWith({
        prefix: "[pypi/test-package]",
        message:
          "Failed to retrieve GitHub Actions OIDC token for https://upload.pypi.org/simple/",
      });
    });
  });

  describe("GitLab CI/CD publisher", () => {
    it("should return NPM_ID_TOKEN environment variable for GitLab CI/CD", async () => {
      const expectedToken = "gitlab_test_token";
      const audience = "pypi";
      process.env.NPM_ID_TOKEN = expectedToken;

      mockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(
          200,
          { audience },
          { headers: { "Content-Type": "application/json" } },
        );

      const gitlabContext = {
        ciEnv: { name: TrustedPublisher.GITLAB_CI_CD_PIPELINES },
        logger,
        package: { uniqueName },
      } as unknown as Pick<
        AnalyzeCommitsContext,
        "ciEnv" | "logger" | "package"
      >;

      const result = await getTrustedPublisherIdToken(
        gitlabContext,
        pypiPackageContext,
      );

      expect(result).toBe(expectedToken);
      expect(mockGetIDToken).not.toHaveBeenCalled();
    });

    it("should return undefined when NPM_ID_TOKEN is not set for GitLab CI/CD", async () => {
      const audience = "pypi";

      mockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(
          200,
          { audience },
          { headers: { "Content-Type": "application/json" } },
        );

      const gitlabContext = {
        ciEnv: { name: TrustedPublisher.GITLAB_CI_CD_PIPELINES },
        logger,
        package: { uniqueName },
      } as unknown as Pick<
        AnalyzeCommitsContext,
        "ciEnv" | "logger" | "package"
      >;

      const result = await getTrustedPublisherIdToken(
        gitlabContext,
        pypiPackageContext,
      );

      expect(result).toBeUndefined();
      expect(mockGetIDToken).not.toHaveBeenCalled();
    });
  });

  describe("unknown publisher", () => {
    it("should return undefined for unknown publisher", async () => {
      const audience = "pypi";

      mockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(
          200,
          { audience },
          { headers: { "Content-Type": "application/json" } },
        );

      const unknownContext = {
        ciEnv: { name: "Unknown CI" },
        logger,
        package: { uniqueName },
      } as unknown as Pick<
        AnalyzeCommitsContext,
        "ciEnv" | "logger" | "package"
      >;

      const result = await getTrustedPublisherIdToken(
        unknownContext,
        pypiPackageContext,
      );

      expect(result).toBeUndefined();
      expect(mockGetIDToken).not.toHaveBeenCalled();
    });

    it("should handle ciEnv without name property", async () => {
      const audience = "pypi";

      mockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(
          200,
          { audience },
          { headers: { "Content-Type": "application/json" } },
        );

      const contextWithoutName = {
        ciEnv: {},
        logger,
        package: { uniqueName },
      } as unknown as Pick<
        AnalyzeCommitsContext,
        "ciEnv" | "logger" | "package"
      >;

      const result = await getTrustedPublisherIdToken(
        contextWithoutName,
        pypiPackageContext,
      );

      expect(result).toBeUndefined();
      expect(mockGetIDToken).not.toHaveBeenCalled();
    });
  });

  describe("URL handling", () => {
    it("should handle different registry URLs correctly", async () => {
      const customRegistry = {
        publishUrl: "https://test.pypi.org/simple/",
      };
      const customPackageContext = {
        registry: customRegistry,
      } as Pick<PyPIPackageContext, "registry">;

      const customMockAgent = new MockAgent();
      customMockAgent.disableNetConnect();
      setGlobalDispatcher(customMockAgent);
      const customMockPool = customMockAgent.get("https://test.pypi.org");

      customMockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(404);

      const result = await getTrustedPublisherIdToken(
        baseContext,
        customPackageContext,
      );

      expect(result).toBeUndefined();

      await customMockAgent.close();
    });

    it("should handle registry URLs with paths correctly", async () => {
      const registryWithPath = {
        publishUrl: "https://custom.pypi.org/legacy/",
      };
      const customPackageContext = {
        registry: registryWithPath,
      } as Pick<PyPIPackageContext, "registry">;

      const customMockAgent = new MockAgent();
      customMockAgent.disableNetConnect();
      setGlobalDispatcher(customMockAgent);
      const customMockPool = customMockAgent.get("https://custom.pypi.org");

      customMockPool
        .intercept({
          method: "GET",
          path: "/_/oidc/audience",
        })
        .reply(404);

      const result = await getTrustedPublisherIdToken(
        baseContext,
        customPackageContext,
      );

      expect(result).toBeUndefined();

      await customMockAgent.close();
    });
  });
});
