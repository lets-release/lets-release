import debug from "debug";
import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { exchangeTrustedPublisherToken } from "src/helpers/exchangeTrustedPublisherToken";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("debug");

const mockDebug = vi.fn();

vi.mocked(debug).mockReturnValue(mockDebug as unknown as debug.Debugger);

describe("exchangeTrustedPublisherToken", () => {
  const registryUrl = "https://registry.npmjs.org";
  const registry = `${registryUrl}/`;
  const pkgName = "test-package";
  const uniqueName = "test-package";
  const idToken = "test-id-token";

  const logger = {
    warn: vi.fn(),
  };

  const context = {
    logger,
    package: { name: pkgName, uniqueName },
  } as unknown as Pick<AnalyzeCommitsContext, "logger" | "package">;

  const npmPackageContext = {
    registry,
  } as Pick<NpmPackageContext, "registry">;

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
    const expectedToken = "npm-token-12345";

    mockPool
      .intercept({
        method: "POST",
        path: `/-/npm/v1/oidc/token/exchange/package/${encodeURIComponent(pkgName)}`,
      })
      .reply(
        200,
        { token: expectedToken },
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      npmPackageContext,
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
        path: `/-/npm/v1/oidc/token/exchange/package/${encodeURIComponent(pkgName)}`,
      })
      .reply(
        401,
        { message: errorMessage },
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      npmPackageContext,
      idToken,
    );

    expect(result).toBeUndefined();

    expect(mockDebug).toHaveBeenCalledWith(
      `Failed to exchange OIDC token with ${registry}: 401 ${errorMessage}`,
    );

    expect(logger.warn).toHaveBeenCalledWith({
      prefix: `[${uniqueName}]`,
      message: `Failed to exchange OIDC token with ${registry}`,
    });
  });

  it("should handle package names that need URL encoding", async () => {
    const specialPkgName = "@scope/package-name";
    const encodedPkgName = encodeURIComponent(specialPkgName);
    const expectedToken = "npm-token-encoded";

    const specialContext = {
      logger,
      package: { name: specialPkgName, uniqueName: specialPkgName },
    } as unknown as Pick<AnalyzeCommitsContext, "logger" | "package">;

    mockPool
      .intercept({
        method: "POST",
        path: `/-/npm/v1/oidc/token/exchange/package/${encodedPkgName}`,
      })
      .reply(
        200,
        { token: expectedToken },
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      specialContext,
      npmPackageContext,
      idToken,
    );

    expect(result).toBe(expectedToken);
  });

  it("should send correct Authorization header", async () => {
    const expectedToken = "npm-token-auth";

    mockPool
      .intercept({
        method: "POST",
        path: `/-/npm/v1/oidc/token/exchange/package/${encodeURIComponent(pkgName)}`,
      })
      .reply(
        200,
        { token: expectedToken },
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      npmPackageContext,
      idToken,
    );

    // Verify the request was successful
    expect(result).toBe(expectedToken);
  });

  it("should handle server error responses", async () => {
    const errorMessage = "Internal Server Error";

    mockPool
      .intercept({
        method: "POST",
        path: `/-/npm/v1/oidc/token/exchange/package/${encodeURIComponent(pkgName)}`,
      })
      .reply(
        500,
        { message: errorMessage },
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      npmPackageContext,
      idToken,
    );

    expect(result).toBeUndefined();

    expect(mockDebug).toHaveBeenCalledWith(
      `Failed to exchange OIDC token with ${registry}: 500 ${errorMessage}`,
    );

    expect(logger.warn).toHaveBeenCalledWith({
      prefix: `[${uniqueName}]`,
      message: `Failed to exchange OIDC token with ${registry}`,
    });
  });

  it("should handle response without message field in error case", async () => {
    mockPool
      .intercept({
        method: "POST",
        path: `/-/npm/v1/oidc/token/exchange/package/${encodeURIComponent(pkgName)}`,
      })
      .reply(
        401,
        { error: "unauthorized" }, // Different structure without 'message' field
        { headers: { "Content-Type": "application/json" } },
      );

    const result = await exchangeTrustedPublisherToken(
      context,
      npmPackageContext,
      idToken,
    );

    expect(result).toBeUndefined();

    expect(mockDebug).toHaveBeenCalledWith(
      `Failed to exchange OIDC token with ${registry}: 401 undefined`,
    );
  });
});
