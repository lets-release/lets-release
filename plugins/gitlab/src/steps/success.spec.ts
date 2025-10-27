import {
  Gitlab,
  IssueSchemaWithBasicLabels,
  MergeRequestSchema,
} from "@gitbeaker/core";

import { SuccessContext } from "@lets-release/config";
import { parseIssues } from "@lets-release/git-host";

import { GITLAB_ARTIFACT_NAME } from "src/constants/GITLAB_ARTIFACT_NAME";
import { addComment } from "src/helpers/addComment";
import { ensureGitLabContext } from "src/helpers/ensureGitLabContext";
import { findIssues } from "src/helpers/findIssues";
import { getAssociatedMergeRequests } from "src/helpers/getAssociatedMergeRequests";
import { ResolvedGitLabOptions } from "src/schemas/GitLabOptions";
import { success } from "src/steps/success";

vi.mock("@lets-release/git-host", async () => {
  const origin = await vi.importActual("@lets-release/git-host");

  return { ...origin, parseIssues: vi.fn() };
});
vi.mock("src/helpers/addComment");
vi.mock("src/helpers/closeLetsReleaseIssue");
vi.mock("src/helpers/ensureGitLabContext");
vi.mock("src/helpers/findIssues");
vi.mock("src/helpers/findLetsReleaseIssues");
vi.mock("src/helpers/getAssociatedMergeRequests");
vi.mock("src/schemas/GitLabOptions");

const context = {
  package: { uniqueName: "npm/pkg" },
  commits: [{ hash: "123", message: "fix: some bug" }],
  nextRelease: { tag: "v1.0.0", notes: "Release notes" },
  releases: [{ tag: "v1.0.0", artifacts: [{ name: GITLAB_ARTIFACT_NAME }] }],
} as unknown as SuccessContext;
const options = {
  url: "https://gitlab.com",
  commentOnSuccess: true,
  successComment: "Success!",
  successLabels: ["released"],
  positionOfOtherArtifacts: "top",
  reportOnFailure: true,
} as unknown as ResolvedGitLabOptions;
const allIssuesClosed = vi.fn();
const edit = vi.fn();
const gitlab = {
  MergeRequests: {
    allIssuesClosed,
  },
  ProjectReleases: {
    edit,
  },
} as unknown as Gitlab;

describe("success", () => {
  beforeEach(() => {
    vi.mocked(parseIssues).mockReset().mockReturnValue([1]);
    vi.mocked(addComment).mockReset().mockResolvedValue([]);
    vi.mocked(ensureGitLabContext).mockReset().mockResolvedValue({
      gitlab,
      owner: "owner",
      repo: "repo",
      projectId: "owner/repo",
      options,
    });
    vi.mocked(findIssues).mockReset().mockResolvedValue([]);
    vi.mocked(getAssociatedMergeRequests).mockReset().mockResolvedValue([]);
    allIssuesClosed.mockReset().mockResolvedValue([]);
  });

  it("should handle no commits", async () => {
    const noCommitsContext = { ...context, commits: [] };

    await success(noCommitsContext, options);
  });

  it("should handle associated merge requests and issues", async () => {
    vi.mocked(getAssociatedMergeRequests).mockResolvedValueOnce([
      { iid: 1, project_id: 1 },
    ] as MergeRequestSchema[]);
    vi.mocked(findIssues).mockResolvedValueOnce([
      { iid: 3 },
    ] as IssueSchemaWithBasicLabels[]);
    allIssuesClosed.mockResolvedValueOnce([{ state: "closed", iid: 2 }]);

    await success(context, options);

    expect(getAssociatedMergeRequests).toHaveBeenCalled();
    expect(allIssuesClosed).toHaveBeenCalled();
    expect(findIssues).toHaveBeenCalled();
    expect(addComment).toHaveBeenCalled();
  });

  it("should handle additional artifacts", async () => {
    vi.mocked(ensureGitLabContext)
      .mockReset()
      .mockResolvedValue({
        gitlab,
        owner: "owner",
        repo: "repo",
        projectId: "owner/repo",
        options: { ...options, url: "https://gitlab.example.com" },
      });
    await success(
      {
        ...context,
        nextRelease: { tag: "v1.0.0" },
        releases: [
          {
            tag: "v1.0.0",
            artifacts: [{ name: GITLAB_ARTIFACT_NAME }, { name: "artifact1" }],
          },
        ],
      } as unknown as SuccessContext,
      options,
    );

    expect(edit).toHaveBeenCalledWith("owner/repo", "v1.0.0", {
      description: "This release is also available on:\n- `artifact1`\n---\n",
    });
  });

  it("should handle additional artifacts on bottom", async () => {
    vi.mocked(ensureGitLabContext).mockResolvedValue({
      gitlab,
      owner: "owner",
      repo: "repo",
      projectId: "owner/repo",
      options: {
        ...options,
        positionOfOtherArtifacts: "bottom",
      },
    });

    await success(
      {
        ...context,
        nextRelease: { tag: "v1.0.0" },
        releases: [
          {
            tag: "v1.0.0",
            artifacts: [{ name: GITLAB_ARTIFACT_NAME }, { name: "artifact1" }],
          },
        ],
      } as unknown as SuccessContext,
      options,
    );

    expect(edit).toHaveBeenCalledWith("owner/repo", "v1.0.0", {
      description: "\n---\nThis release is also available on:\n- `artifact1`",
    });
  });

  it("should skip comment processing when commentOnSuccess is false", async () => {
    const noCommentOptions = { ...options, commentOnSuccess: false };
    vi.mocked(ensureGitLabContext).mockResolvedValue({
      gitlab,
      owner: "owner",
      repo: "repo",
      projectId: "owner/repo",
      options: noCommentOptions,
    });

    await success(context, noCommentOptions);

    expect(getAssociatedMergeRequests).not.toHaveBeenCalled();
    expect(findIssues).not.toHaveBeenCalled();
    expect(addComment).not.toHaveBeenCalled();
  });

  it("should throw an AggregateError if there are errors", async () => {
    vi.mocked(getAssociatedMergeRequests).mockResolvedValueOnce([
      { iid: 1, project_id: 1 },
    ] as MergeRequestSchema[]);
    vi.mocked(addComment).mockResolvedValueOnce([new Error("Comment error")]);

    await expect(success(context, options)).rejects.toThrow(AggregateError);
  });
});
