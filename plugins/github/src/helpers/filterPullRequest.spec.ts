import { filterPullRequest } from "src/helpers/filterPullRequest";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { PullRequest } from "src/types/PullRequest";

const paginate = vi.fn();
const request = vi.fn();
const octokit = { paginate, request } as unknown as LetsReleaseOctokit;
const owner = "test-owner";
const repo = "test-repo";
const pullRequest = { number: 1 } as PullRequest;
const shas = ["sha1", "sha2"];

describe("filterPullRequest", () => {
  beforeEach(() => {
    paginate.mockReset();
    request.mockReset();
  });

  it("should return true if any commit sha matches", async () => {
    paginate.mockResolvedValue([{ sha: "sha1" }]);
    request.mockResolvedValue({
      data: { merge_commit_sha: "sha3" },
    });

    const result = await filterPullRequest(
      octokit,
      owner,
      repo,
      shas,
      pullRequest,
    );
    expect(result).toBe(true);
  });

  it("should return true if merge commit sha matches", async () => {
    paginate.mockResolvedValue([{ sha: "sha3" }]);
    request.mockResolvedValue({
      data: { merge_commit_sha: "sha2" },
    });

    const result = await filterPullRequest(
      octokit,
      owner,
      repo,
      shas,
      pullRequest,
    );
    expect(result).toBe(true);
  });

  it("should return false if no commit sha matches", async () => {
    paginate.mockResolvedValue([{ sha: "sha3" }]);
    request.mockResolvedValue({
      data: { merge_commit_sha: "sha4" },
    });

    const result = await filterPullRequest(
      octokit,
      owner,
      repo,
      shas,
      pullRequest,
    );
    expect(result).toBe(false);
  });

  it("should return false if no merge commit sha matches", async () => {
    paginate.mockResolvedValue([{ sha: "sha3" }]);
    request.mockResolvedValue({
      data: { merge_commit_sha: null },
    });

    const result = await filterPullRequest(
      octokit,
      owner,
      repo,
      shas,
      pullRequest,
    );
    expect(result).toBe(false);
  });
});
