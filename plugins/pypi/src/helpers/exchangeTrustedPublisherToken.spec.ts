import debug from "debug";
import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { exchangeTrustedPublisherToken } from "src/helpers/exchangeTrustedPublisherToken";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("debug");

const mockDebug = vi.fn();

vi.mocked(debug).mockReturnValue(mockDebug as unknown as debug.Debugger);

describe("exchangeTrustedPublisherToken", () => {
  const registryUrl = "https://upload.pypi.org";
  const publishUrl = "https://upload.pypi.org/legacy/";
  const uniqueName = "pypi/test-package";
  const idToken = "test-id-token";

  const logger = {
    warn: vi.fn(),
  };

  const context = {
    logger,
    package: { uniqueName },
  } as unknown as Pick<AnalyzeCommitsContext, "logger" | "package">;

  const pypiPackageContext = {
    registry: { publishUrl },
  } as Pick<PyPIPackageContext, "registry">;

  let mockAgent: MockAgent;
  let mockPool: Interceptable;

  beforeEach(() => {
    mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);
    mockPool = mockAgent.get(registryUrl);

    vi.clearAllMocks();
  });

  afterEach(async () => {
    await mockAgent.close();
  });

  it("should return token when OIDC token exchange succeeds", async () => {
    const expectedToken = "pypi-token-12345";

    mockPool
      .intercept({
        method: "POST",
        path: "/_/oidc/mint-token",
        body: JSON.stringify({ token: idToken }),
      })
      .reply(
        200,
        { token: expectedToken },
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      pypiPackageContext,
      idToken,
    );

    expect(result).toBe(expectedToken);
    expect(logger.warn).not.toHaveBeenCalled();
    expect(mockDebug).not.toHaveBeenCalled();
  });

  it("should log warning and debug when OIDC token exchange fails", async () => {
    const errorMessage = "Invalid token";

    mockPool
      .intercept({
        method: "POST",
        path: "/_/oidc/mint-token",
        body: JSON.stringify({ token: idToken }),
      })
      .reply(
        401,
        { message: errorMessage },
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      pypiPackageContext,
      idToken,
    );

    expect(result).toBeUndefined();

    expect(mockDebug).toHaveBeenCalledWith(
      `Failed to exchange OIDC token with ${publishUrl}: 401 ${errorMessage}`,
    );

    expect(logger.warn).toHaveBeenCalledWith({
      prefix: `[${uniqueName}]`,
      message: `Failed to exchange OIDC token with ${publishUrl}`,
    });
  });

  it("should send correct request body with idToken", async () => {
    const expectedToken = "pypi-token-body";

    mockPool
      .intercept({
        method: "POST",
        path: "/_/oidc/mint-token",
        body: JSON.stringify({ token: idToken }),
      })
      .reply(
        200,
        { token: expectedToken },
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      pypiPackageContext,
      idToken,
    );

    expect(result).toBe(expectedToken);
  });

  it("should handle server error responses", async () => {
    const errorMessage = "Internal Server Error";

    mockPool
      .intercept({
        method: "POST",
        path: "/_/oidc/mint-token",
        body: JSON.stringify({ token: idToken }),
      })
      .reply(
        500,
        { message: errorMessage },
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      pypiPackageContext,
      idToken,
    );

    expect(result).toBeUndefined();

    expect(mockDebug).toHaveBeenCalledWith(
      `Failed to exchange OIDC token with ${publishUrl}: 500 ${errorMessage}`,
    );

    expect(logger.warn).toHaveBeenCalledWith({
      prefix: `[${uniqueName}]`,
      message: `Failed to exchange OIDC token with ${publishUrl}`,
    });
  });

  it("should handle response without message field in error case", async () => {
    mockPool
      .intercept({
        method: "POST",
        path: "/_/oidc/mint-token",
        body: JSON.stringify({ token: idToken }),
      })
      .reply(
        401,
        { error: "unauthorized" }, // Different structure without 'message' field
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      pypiPackageContext,
      idToken,
    );

    expect(result).toBeUndefined();

    expect(mockDebug).toHaveBeenCalledWith(
      `Failed to exchange OIDC token with ${publishUrl}: 401 undefined`,
    );
  });

  it("should handle network errors", async () => {
    mockPool
      .intercept({
        method: "POST",
        path: "/_/oidc/mint-token",
        body: JSON.stringify({ token: idToken }),
      })
      .replyWithError(new Error("Network error"));

    const result = await exchangeTrustedPublisherToken(
      context,
      pypiPackageContext,
      idToken,
    );

    expect(result).toBeUndefined();

    expect(mockDebug).toHaveBeenCalledWith(
      `Failed to exchange OIDC token with ${publishUrl}`,
    );
    expect(mockDebug).toHaveBeenCalledWith(expect.any(Error));

    expect(logger.warn).toHaveBeenCalledWith({
      prefix: `[${uniqueName}]`,
      message: `Failed to exchange OIDC token with ${publishUrl}`,
    });
  });

  it("should handle invalid JSON responses", async () => {
    mockPool
      .intercept({
        method: "POST",
        path: "/_/oidc/mint-token",
        body: JSON.stringify({ token: idToken }),
      })
      .reply(200, "invalid json", {
        headers: { "Content-Type": "application/json" },
      });

    const result = await exchangeTrustedPublisherToken(
      context,
      pypiPackageContext,
      idToken,
    );

    expect(result).toBeUndefined();

    expect(mockDebug).toHaveBeenCalledWith(
      `Failed to exchange OIDC token with ${publishUrl}`,
    );
    expect(mockDebug).toHaveBeenCalledWith(expect.any(Error));

    expect(logger.warn).toHaveBeenCalledWith({
      prefix: `[${uniqueName}]`,
      message: `Failed to exchange OIDC token with ${publishUrl}`,
    });
  });

  it("should handle successful response with missing token field", async () => {
    mockPool
      .intercept({
        method: "POST",
        path: "/_/oidc/mint-token",
        body: JSON.stringify({ token: idToken }),
      })
      .reply(
        200,
        { success: true }, // No token field
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      pypiPackageContext,
      idToken,
    );

    expect(result).toBeUndefined();
  });

  it("should handle different registry publishUrl origins", async () => {
    const customPublishUrl = "https://test.pypi.org/legacy/";
    const customPypiPackageContext = {
      registry: { publishUrl: customPublishUrl },
    } as Pick<PyPIPackageContext, "registry">;

    const customMockAgent = new MockAgent();
    customMockAgent.disableNetConnect();
    setGlobalDispatcher(customMockAgent);
    const customMockPool = customMockAgent.get("https://test.pypi.org");

    const expectedToken = "test-pypi-token";

    customMockPool
      .intercept({
        method: "POST",
        path: "/_/oidc/mint-token",
        body: JSON.stringify({ token: idToken }),
      })
      .reply(
        200,
        { token: expectedToken },
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      customPypiPackageContext,
      idToken,
    );

    expect(result).toBe(expectedToken);

    await customMockAgent.close();
  });

  it("should handle empty idToken", async () => {
    const expectedToken = "pypi-token-empty";
    const emptyIdToken = "";

    mockPool
      .intercept({
        method: "POST",
        path: "/_/oidc/mint-token",
        body: JSON.stringify({ token: emptyIdToken }),
      })
      .reply(
        200,
        { token: expectedToken },
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      pypiPackageContext,
      emptyIdToken,
    );

    expect(result).toBe(expectedToken);
  });
});
