import { Response, fetch } from "undici";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { DEFAULT_PYPI_USERNAME } from "src/constants/DEFAULT_PYPI_USERNAME";
import { NeedAuthError } from "src/errors/NeedAuthError";
import { getAuth } from "src/helpers/getAuth";
import { verifyAuth } from "src/helpers/verifyAuth";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("undici");
vi.mock("src/helpers/getAuth");

const context = { env: {}, package: {} } as AnalyzeCommitsContext;
const pkgContext = {
  registry: { publishUrl: "https://test.pypi.org/legacy/" },
} as PyPIPackageContext;

describe("verifyAuth", () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
    vi.mocked(getAuth).mockReset();
  });

  it("should throw NeedAuthError if no token or password is provided", async () => {
    vi.mocked(getAuth).mockResolvedValue({
      token: undefined,
      username: DEFAULT_PYPI_USERNAME,
      password: undefined,
    });

    await expect(verifyAuth(context, pkgContext)).rejects.toThrow(
      NeedAuthError,
    );
  });

  it("should verify auth with token", async () => {
    vi.mocked(getAuth).mockResolvedValue({
      token: "test-token",
      username: DEFAULT_PYPI_USERNAME,
      password: undefined,
    });
    vi.mocked(fetch).mockResolvedValue({ status: 200 } as Response);

    await expect(verifyAuth(context, pkgContext)).resolves.toBeUndefined();
  });

  it("should verify auth with password", async () => {
    vi.mocked(getAuth).mockResolvedValue({
      token: undefined,
      username: DEFAULT_PYPI_USERNAME,
      password: "test-password",
    });
    vi.mocked(fetch).mockResolvedValue({ status: 200 } as Response);

    await expect(verifyAuth(context, pkgContext)).resolves.toBeUndefined();
  });

  it("should throw NeedAuthError if response status is 403", async () => {
    vi.mocked(getAuth).mockResolvedValue({
      token: "test-token",
      username: DEFAULT_PYPI_USERNAME,
      password: "test-password",
    });
    vi.mocked(fetch).mockResolvedValue({ status: 403 } as Response);

    await expect(verifyAuth(context, pkgContext)).rejects.toThrow(
      NeedAuthError,
    );
  });
});
