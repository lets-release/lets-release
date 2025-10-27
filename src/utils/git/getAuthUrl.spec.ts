import { getAuthUrl } from "src/utils/git/getAuthUrl";
import { verifyAuth } from "src/utils/git/verifyAuth";
import { verifyAuthUrl } from "src/utils/git/verifyAuthUrl";

vi.mock("src/utils/git/verifyAuth");
vi.mock("src/utils/git/verifyAuthUrl");

describe("getAuthUrl", () => {
  beforeEach(() => {
    vi.mocked(verifyAuth).mockReset();
  });

  it("should expand shorthand URLs", async () => {
    expect(await getAuthUrl("owner/repo", "main")).toBe(
      "https://github.com/owner/repo.git",
    );
  });

  it("should replace `git+https` with `https`", async () => {
    expect(await getAuthUrl("git+https://example.com/owner/repo", "main")).toBe(
      "https://example.com/owner/repo",
    );
  });

  it("should replace `git+http` with `http`", async () => {
    expect(await getAuthUrl("git+http://example.com/owner/repo", "main")).toBe(
      "http://example.com/owner/repo",
    );
  });

  it("should format to https url without credential prefix if ssh key auth failed", async () => {
    vi.mocked(verifyAuth).mockRejectedValueOnce(new Error("Auth failed"));

    expect(
      await getAuthUrl("git@github.com:owner/repo.git", "main", {
        env: {
          GH_TOKEN: "token",
        },
      }),
    ).toBe("https://token@github.com/owner/repo.git");
  });

  it("should format to https url with credential prefix if ssh key auth failed", async () => {
    vi.mocked(verifyAuth).mockRejectedValueOnce(new Error("Auth failed"));

    expect(
      await getAuthUrl("git@github.com:owner/repo.git", "main", {
        env: {
          GITHUB_TOKEN: "token",
          GITHUB_ACTION: "true",
        },
      }),
    ).toBe("https://x-access-token:token@github.com/owner/repo.git");
  });

  it("should return first valid authenticated url when multiple credentials exist", async () => {
    vi.mocked(verifyAuth).mockRejectedValueOnce(new Error("Auth failed"));
    vi.mocked(verifyAuthUrl)
      .mockResolvedValueOnce("https://token@github.com/owner/repo.git")
      .mockResolvedValueOnce(null);

    expect(
      await getAuthUrl("git@github.com:owner/repo.git", "main", {
        env: {
          GH_TOKEN: "token",
          GITHUB_TOKEN: "token",
          GITHUB_ACTION: "true",
        },
      }),
    ).toBe("https://token@github.com/owner/repo.git");
  });

  it("should return normalized url when no auth environment variables are found", async () => {
    vi.mocked(verifyAuth).mockRejectedValue(new Error("Auth failed"));

    expect(
      await getAuthUrl("git@github.com:owner/repo.git", "main", {
        env: {},
      }),
    ).toBe("git@github.com:owner/repo.git");
  });

  it("should return normalized url when all authentication methods fail", async () => {
    vi.mocked(verifyAuth).mockRejectedValue(new Error("Auth failed"));
    vi.mocked(verifyAuthUrl).mockResolvedValue(null);

    expect(
      await getAuthUrl("git@github.com:owner/repo.git", "main", {
        env: {
          GH_TOKEN: "invalid-token-1",
          GL_TOKEN: "invalid-token-2",
        },
      }),
    ).toBe("git@github.com:owner/repo.git");
  });
});
