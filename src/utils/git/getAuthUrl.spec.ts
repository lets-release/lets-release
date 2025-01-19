import { getAuthUrl } from "src/utils/git/getAuthUrl";
import { verifyAuth } from "src/utils/git/verifyAuth";

vi.mock("src/utils/git/verifyAuth");

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

  it("should return first formatted url if ssh key auth failed", async () => {
    vi.mocked(verifyAuth).mockRejectedValueOnce(new Error("Auth failed"));

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
});
