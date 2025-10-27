import FormData from "form-data";
import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { DEFAULT_PYPI_USERNAME } from "src/constants/DEFAULT_PYPI_USERNAME";
import { NeedAuthError } from "src/errors/NeedAuthError";
import { exchangeTrustedPublisherToken } from "src/helpers/exchangeTrustedPublisherToken";
import { getAuth } from "src/helpers/getAuth";
import { getTrustedPublisherIdToken } from "src/helpers/getTrustedPublisherIdToken";
import { verifyAuth } from "src/helpers/verifyAuth";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

// Use vi.mock for form-data
vi.mock("form-data", () => {
  class FormData {
    append() {
      //
    }
    getHeaders() {
      //
    }
  }

  return {
    default: FormData,
  };
});

// Mock dependencies
vi.mock("src/helpers/getTrustedPublisherIdToken");
vi.mock("src/helpers/exchangeTrustedPublisherToken");
vi.mock("src/helpers/getAuth");

// Mock FormData
const mockAppend = vi.fn();
const mockGetHeaders = vi.fn().mockReturnValue({
  "content-type": "multipart/form-data; boundary=test-boundary",
});
FormData.prototype.append = mockAppend;
FormData.prototype.getHeaders = mockGetHeaders;

const mockGetTrustedPublisherIdToken = vi.mocked(getTrustedPublisherIdToken);
const mockExchangeTrustedPublisherToken = vi.mocked(
  exchangeTrustedPublisherToken,
);
const mockGetAuth = vi.mocked(getAuth);

// Test data
const logger = { warn: vi.fn() };
const pkg = {
  path: "/root/pkg",
  name: "test-package",
  uniqueName: "pypi/test-package",
};

const baseContext = {
  ciEnv: { name: "GitHub Actions" },
  env: {},
  logger,
  package: pkg,
} as unknown as Pick<
  AnalyzeCommitsContext,
  "ciEnv" | "env" | "logger" | "package"
>;

const pkgContext = {
  registry: { publishUrl: "https://upload.pypi.org/legacy/" },
} as PyPIPackageContext;

describe("verifyAuth", () => {
  let mockAgent: MockAgent;
  let mockPool: Interceptable;

  beforeEach(() => {
    mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);
    mockPool = mockAgent.get("https://upload.pypi.org");

    vi.clearAllMocks();
    mockAppend.mockClear();
    mockGetHeaders.mockClear();
  });

  afterEach(async () => {
    await mockAgent.close();
  });

  describe("with trusted publisher authentication", () => {
    it("should return early when trusted publisher token exchange succeeds", async () => {
      mockGetTrustedPublisherIdToken.mockResolvedValue("id-token");
      mockExchangeTrustedPublisherToken.mockResolvedValue("pypi-token");

      await verifyAuth(baseContext, pkgContext);

      expect(mockGetTrustedPublisherIdToken).toHaveBeenCalledWith(
        baseContext,
        pkgContext,
      );
      expect(mockExchangeTrustedPublisherToken).toHaveBeenCalledWith(
        baseContext,
        pkgContext,
        "id-token",
      );
      expect(mockGetAuth).not.toHaveBeenCalled();
    });

    it("should fallback to traditional auth when no trusted publisher token", async () => {
      mockGetTrustedPublisherIdToken.mockResolvedValue(undefined);
      mockGetAuth.mockResolvedValue({
        token: "test-token",
        username: DEFAULT_PYPI_USERNAME,
        password: undefined,
      });

      mockPool
        .intercept({
          method: "POST",
          path: "/legacy/",
        })
        .reply(200);

      await verifyAuth(baseContext, pkgContext);

      expect(mockGetTrustedPublisherIdToken).toHaveBeenCalled();
      expect(mockExchangeTrustedPublisherToken).not.toHaveBeenCalled();
      expect(mockGetAuth).toHaveBeenCalledWith(baseContext, pkgContext);
    });

    it("should fallback to traditional auth when token exchange fails", async () => {
      mockGetTrustedPublisherIdToken.mockResolvedValue("id-token");
      mockExchangeTrustedPublisherToken.mockResolvedValue(undefined);
      mockGetAuth.mockResolvedValue({
        token: "test-token",
        username: DEFAULT_PYPI_USERNAME,
        password: undefined,
      });

      mockPool
        .intercept({
          method: "POST",
          path: "/legacy/",
        })
        .reply(200);

      await verifyAuth(baseContext, pkgContext);

      expect(mockGetTrustedPublisherIdToken).toHaveBeenCalled();
      expect(mockExchangeTrustedPublisherToken).toHaveBeenCalled();
      expect(mockGetAuth).toHaveBeenCalled();
    });
  });

  describe("with traditional authentication", () => {
    beforeEach(() => {
      mockGetTrustedPublisherIdToken.mockResolvedValue(undefined);
    });

    it("should throw NeedAuthError if no token or password is provided", async () => {
      mockGetAuth.mockResolvedValue({
        token: undefined,
        username: DEFAULT_PYPI_USERNAME,
        password: undefined,
      });

      await expect(verifyAuth(baseContext, pkgContext)).rejects.toThrow(
        NeedAuthError,
      );

      expect(mockGetAuth).toHaveBeenCalled();
    });

    it("should verify auth with token", async () => {
      mockGetAuth.mockResolvedValue({
        token: "test-token",
        username: DEFAULT_PYPI_USERNAME,
        password: undefined,
      });

      mockPool
        .intercept({
          method: "POST",
          path: "/legacy/",
        })
        .reply(200);

      await verifyAuth(baseContext, pkgContext);

      expect(mockAppend).toHaveBeenCalledWith(":action", "file_upload");
      expect(mockGetHeaders).toHaveBeenCalled();
    });

    it("should verify auth with password", async () => {
      mockGetAuth.mockResolvedValue({
        token: undefined,
        username: "test-user",
        password: "test-password",
      });

      mockPool
        .intercept({
          method: "POST",
          path: "/legacy/",
        })
        .reply(200);

      await verifyAuth(baseContext, pkgContext);

      expect(mockAppend).toHaveBeenCalledWith(":action", "file_upload");
      expect(mockGetHeaders).toHaveBeenCalled();
    });

    it("should verify auth with both token and password (token takes precedence)", async () => {
      mockGetAuth.mockResolvedValue({
        token: "test-token",
        username: "test-user",
        password: "test-password",
      });

      mockPool
        .intercept({
          method: "POST",
          path: "/legacy/",
        })
        .reply(200);

      await verifyAuth(baseContext, pkgContext);

      expect(mockAppend).toHaveBeenCalledWith(":action", "file_upload");
      expect(mockGetHeaders).toHaveBeenCalled();
    });

    it("should throw NeedAuthError if response status is 403", async () => {
      mockGetAuth.mockResolvedValue({
        token: "test-token",
        username: DEFAULT_PYPI_USERNAME,
        password: undefined,
      });

      mockPool
        .intercept({
          method: "POST",
          path: "/legacy/",
        })
        .reply(403);

      await expect(verifyAuth(baseContext, pkgContext)).rejects.toThrow(
        NeedAuthError,
      );
    });

    it("should not throw error for non-403 status codes", async () => {
      mockGetAuth.mockResolvedValue({
        token: "test-token",
        username: DEFAULT_PYPI_USERNAME,
        password: undefined,
      });

      mockPool
        .intercept({
          method: "POST",
          path: "/legacy/",
        })
        .reply(400);

      await verifyAuth(baseContext, pkgContext);

      expect(mockAppend).toHaveBeenCalledWith(":action", "file_upload");
    });

    it("should handle different publishUrl correctly", async () => {
      const customPkgContext = {
        registry: { publishUrl: "https://test.pypi.org/legacy/" },
      } as PyPIPackageContext;

      mockGetAuth.mockResolvedValue({
        token: "test-token",
        username: DEFAULT_PYPI_USERNAME,
        password: undefined,
      });

      const customMockAgent = new MockAgent();
      customMockAgent.disableNetConnect();
      setGlobalDispatcher(customMockAgent);
      const customMockPool = customMockAgent.get("https://test.pypi.org");

      customMockPool
        .intercept({
          method: "POST",
          path: "/legacy/",
        })
        .reply(200);

      await verifyAuth(baseContext, customPkgContext);

      expect(mockAppend).toHaveBeenCalledWith(":action", "file_upload");

      await customMockAgent.close();
    });

    it("should handle network errors during verification", async () => {
      mockGetAuth.mockResolvedValue({
        token: "test-token",
        username: DEFAULT_PYPI_USERNAME,
        password: undefined,
      });

      mockPool
        .intercept({
          method: "POST",
          path: "/legacy/",
        })
        .replyWithError(new Error("Network error"));

      await expect(verifyAuth(baseContext, pkgContext)).rejects.toThrow(
        /Network error|fetch failed/,
      );
    });
  });

  describe("authorization header construction", () => {
    beforeEach(() => {
      mockGetTrustedPublisherIdToken.mockResolvedValue(undefined);
    });

    it("should create correct authorization header with token", async () => {
      const testToken = "test-token-123";
      mockGetAuth.mockResolvedValue({
        token: testToken,
        username: DEFAULT_PYPI_USERNAME,
        password: undefined,
      });

      const expectedAuth = Buffer.from(
        `${DEFAULT_PYPI_USERNAME}:${testToken}`,
      ).toString("base64");

      mockPool
        .intercept({
          method: "POST",
          path: "/legacy/",
          headers: {
            authorization: `Basic ${expectedAuth}`,
          },
        })
        .reply(200);

      await verifyAuth(baseContext, pkgContext);
    });

    it("should create correct authorization header with username and password", async () => {
      const testUsername = "test-user";
      const testPassword = "test-password-456";
      mockGetAuth.mockResolvedValue({
        token: undefined,
        username: testUsername,
        password: testPassword,
      });

      const expectedAuth = Buffer.from(
        `${testUsername}:${testPassword}`,
      ).toString("base64");

      mockPool
        .intercept({
          method: "POST",
          path: "/legacy/",
          headers: {
            authorization: `Basic ${expectedAuth}`,
          },
        })
        .reply(200);

      await verifyAuth(baseContext, pkgContext);
    });
  });
});
