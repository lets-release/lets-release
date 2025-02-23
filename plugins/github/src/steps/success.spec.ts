import { SuccessContext } from "@lets-release/config";
import { parseIssues } from "@lets-release/git-host";

import { GITHUB_ARTIFACT_NAME } from "src/constants/GITHUB_ARTIFACT_NAME";
import { addComment } from "src/helpers/addComment";
import { ensureGitHubContext } from "src/helpers/ensureGitHubContext";
import { filterPullRequest } from "src/helpers/filterPullRequest";
import { getAssociatedPullRequests } from "src/helpers/getAssociatedPullRequests";
import { getRepoInfo } from "src/helpers/getRepoInfo";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { success } from "src/steps/success";
import { GitHubContext } from "src/types/GitHubContext";
import { PullRequest } from "src/types/PullRequest";

vi.mock("@lets-release/git-host");
vi.mock("src/helpers/ensureGitHubContext");
vi.mock("src/helpers/getRepoInfo");
vi.mock("src/helpers/getAssociatedPullRequests");
vi.mock("src/helpers/filterPullRequest");
vi.mock("src/helpers/generateGetBatchIssuesOrPullRequestsQuery");
vi.mock("src/helpers/addComment");
vi.mock("src/helpers/findLetsReleaseIssues");
vi.mock("src/helpers/closeLetsReleaseIssue");

const graphql = vi.fn();
const request = vi.fn();
const octokit = { graphql, request } as unknown as LetsReleaseOctokit;
const tag = "v1.0.0";
const context = {
  options: { repositoryUrl: "https://github.com/owner/repo" },
  package: { uniqueName: "npm/pkg" },
  commits: [],
  nextRelease: { tag, notes: "Release notes" },
  releases: [
    {
      tag,
      artifacts: [
        { name: GITHUB_ARTIFACT_NAME, id: 1 },
        { name: "other", id: 2 },
      ],
    },
  ],
} as unknown as SuccessContext;
const options = {
  url: "https://github.com",
  commentOnSuccess: true,
  successComment: "Success!",
  successLabels: ["released"],
  positionOfOtherArtifacts: "top",
};

describe("success", () => {
  beforeEach(() => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner: "owner",
        repo: "repo",
        options,
      } as unknown as GitHubContext);
    vi.mocked(getRepoInfo)
      .mockReset()
      .mockResolvedValue({ owner: "owner", repo: "repo" });
    vi.mocked(getAssociatedPullRequests)
      .mockReset()
      .mockResolvedValue([[{ number: 1 }, { number: 2 }]] as PullRequest[][]);
    vi.mocked(filterPullRequest).mockReset().mockResolvedValue(true);
    vi.mocked(parseIssues).mockReset().mockReturnValue([1, 2]);
    vi.mocked(addComment).mockReset().mockResolvedValue([]);
    graphql.mockReset().mockResolvedValue({
      repository: { issue1: { number: 1 }, issue2: { number: 2 } },
    });
  });

  it("should handle no commits", async () => {
    await success(context, {});

    expect(ensureGitHubContext).toHaveBeenCalledTimes(1);
    expect(getRepoInfo).toHaveBeenCalledTimes(1);
  });

  it("should handle commits and comment on success", async () => {
    await success(
      {
        ...context,
        commits: [{ hash: "commit1", message: "fix: some fix" }],
      } as unknown as SuccessContext,
      {},
    );

    expect(getAssociatedPullRequests).toHaveBeenCalledTimes(1);
    expect(filterPullRequest).toHaveBeenCalledTimes(2);
    expect(addComment).toHaveBeenCalledTimes(2);
  });

  it("should handle commits and comment on success with custom github url", async () => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner: "owner",
        repo: "repo",
        options: { ...options, url: "https://custom.github.com" },
      } as unknown as GitHubContext);

    await success(
      {
        ...context,
        commits: [{ hash: "commit1", message: "fix: some fix" }],
      } as unknown as SuccessContext,
      {},
    );

    expect(getAssociatedPullRequests).toHaveBeenCalledTimes(1);
    expect(filterPullRequest).toHaveBeenCalledTimes(2);
    expect(addComment).toHaveBeenCalledTimes(2);
  });

  it("should handle other artifacts on top", async () => {
    await success(context, {});

    expect(request).toHaveBeenCalledWith(
      "PATCH /repos/{owner}/{repo}/releases/{release_id}",
      {
        owner: "owner",
        repo: "repo",
        release_id: 1,
        body: expect.stringContaining("This release is also available on:"),
      },
    );
  });

  it("should handle other artifacts without notes on top", async () => {
    await success(
      { ...context, nextRelease: { ...context.nextRelease, notes: undefined } },
      {},
    );

    expect(request).toHaveBeenCalledWith(
      "PATCH /repos/{owner}/{repo}/releases/{release_id}",
      {
        owner: "owner",
        repo: "repo",
        release_id: 1,
        body: expect.stringContaining("This release is also available on:"),
      },
    );
  });

  it("should handle other artifacts on bottom", async () => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner: "owner",
        repo: "repo",
        options: { ...options, positionOfOtherArtifacts: "bottom" },
      } as unknown as GitHubContext);

    await success(context, {});

    expect(request).toHaveBeenCalledWith(
      "PATCH /repos/{owner}/{repo}/releases/{release_id}",
      {
        owner: "owner",
        repo: "repo",
        release_id: 1,
        body: expect.stringContaining("This release is also available on:"),
      },
    );
  });

  it("should handle other artifacts without notes on bottom", async () => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner: "owner",
        repo: "repo",
        options: { ...options, positionOfOtherArtifacts: "bottom" },
      } as unknown as GitHubContext);

    await success(
      { ...context, nextRelease: { ...context.nextRelease, notes: undefined } },
      {},
    );

    expect(request).toHaveBeenCalledWith(
      "PATCH /repos/{owner}/{repo}/releases/{release_id}",
      {
        owner: "owner",
        repo: "repo",
        release_id: 1,
        body: expect.stringContaining("This release is also available on:"),
      },
    );
  });

  it("should throw an error if there are errors", async () => {
    vi.mocked(addComment).mockResolvedValue([new Error("Comment error")]);

    await expect(
      success(
        {
          ...context,
          commits: [{ hash: "commit1", message: "fix: some fix" }],
        } as unknown as SuccessContext,
        {},
      ),
    ).rejects.toThrow("AggregateError");
  });
});
