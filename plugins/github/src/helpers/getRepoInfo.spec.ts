import { getRepoInfo } from "src/helpers/getRepoInfo";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";

const request = vi.fn();
const octokit = { request } as unknown as LetsReleaseOctokit;

describe("getRepoInfo", () => {
  beforeEach(() => {
    request.mockReset();
  });

  it("should return owner and repo from a valid repository URL", async () => {
    request.mockResolvedValue({
      data: {
        full_name: "owner/repo",
      },
    });

    const repositoryUrl = "https://github.com/owner/repo";
    const result = await getRepoInfo(octokit, repositoryUrl);

    expect(result).toEqual({
      owner: "owner",
      repo: "repo",
    });
    expect(request).toHaveBeenCalledWith("GET /repos/{owner}/{repo}", {
      owner: "owner",
      repo: "repo",
    });
  });

  it("should throw an error if the repository URL is invalid", async () => {
    const repositoryUrl = "invalid-url";

    await expect(getRepoInfo(octokit, repositoryUrl)).rejects.toThrow();
  });

  it("should throw an error if the request fails", async () => {
    request.mockRejectedValue(new Error("Request failed"));

    const repositoryUrl = "https://github.com/owner/repo";

    await expect(getRepoInfo(octokit, repositoryUrl)).rejects.toThrow(
      "Request failed",
    );
  });
});
