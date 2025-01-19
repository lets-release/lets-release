import { verifyAuth } from "src/utils/git/verifyAuth";
import { verifyAuthUrl } from "src/utils/git/verifyAuthUrl";

vi.mock("src/utils/git/verifyAuth");

describe("verifyAuthUrl", () => {
  const url = "https://example.com/repo.git";
  const branch = "main";
  const options = {};

  beforeEach(() => {
    vi.mocked(verifyAuth).mockReset();
  });

  it("should return the URL if verifyAuth is successful", async () => {
    vi.mocked(verifyAuth).mockResolvedValue(undefined);

    await expect(verifyAuthUrl(url, branch, options)).resolves.toBe(url);
  });

  it("should return null if verifyAuth throws an error", async () => {
    vi.mocked(verifyAuth).mockRejectedValue(new Error("Not authorized"));

    await expect(verifyAuthUrl(url, branch, options)).resolves.toBeNull();
  });
});
