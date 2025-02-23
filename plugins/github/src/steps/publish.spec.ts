import { RequestError } from "@octokit/request-error";

import { BranchType, PublishContext } from "@lets-release/config";
import { findUniqueReleaseAssets } from "@lets-release/git-host";

import { GITHUB_ARTIFACT_NAME } from "src/constants/GITHUB_ARTIFACT_NAME";
import { ensureGitHubContext } from "src/helpers/ensureGitHubContext";
import { uploadReleaseAsset } from "src/helpers/uploadReleaseAsset";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { publish } from "src/steps/publish";
import { GitHubContext } from "src/types/GitHubContext";

vi.mock("@lets-release/git-host");
vi.mock("src/helpers/ensureGitHubContext");
vi.mock("src/helpers/uploadReleaseAsset");

const request = vi.fn();
const octokit = { request } as unknown as LetsReleaseOctokit;
const log = vi.fn();
const warn = vi.fn();
const owner = "owner";
const repo = "repo";
const tag = "v1.0.0";
const context = {
  branch: { name: "main", type: BranchType.main },
  package: {
    uniqueName: "npm/pkg",
  },
  nextRelease: { tag },
  logger: { log, warn },
  options: {},
} as unknown as PublishContext;
const options = {
  assets: [],
  draftRelease: false,
  releaseNameTemplate: "Release <%= nextRelease.tag %>",
  releaseBodyTemplate: "Release body for <%= nextRelease.tag %>",
  discussionCategoryName: "General",
};
const error = new RequestError("Not Found", 404, {
  request: { method: "POST", url: "/abc", headers: {} },
  response: {
    status: 404,
    url: "/abc",
    headers: {},
    data: {},
    retryCount: 1,
  },
});

describe("publish", () => {
  beforeEach(() => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner,
        repo,
        options,
      } as unknown as GitHubContext);
    vi.mocked(findUniqueReleaseAssets)
      .mockReset()
      .mockResolvedValue(["asset1", "asset2"]);
    vi.mocked(uploadReleaseAsset).mockReset();
    request.mockReset();
    log.mockClear();
    warn.mockClear();
  });

  it("should skip if it is not the main package", async () => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner,
        repo,
        options: {
          ...options,
          mainPackageOnly: true,
        },
      } as unknown as GitHubContext);

    const result = await publish(context, options);

    expect(warn).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Skip as it is not the main package",
    });
    expect(result).toBeUndefined();
  });

  it("should skip if already published", async () => {
    const result = await publish(context, options);

    expect(request).toHaveBeenCalledWith(
      "GET /repos/{owner}/{repo}/releases/tags/{tag}",
      {
        owner,
        repo,
        tag,
      },
    );
    expect(warn).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: `Skip publishing as tag ${tag} is already published`,
    });
    expect(result).toBeUndefined();
  });

  it("should throw if octokit returns not 404 error", async () => {
    const error = new RequestError("Forbidden", 403, {
      request: { method: "POST", url: "/abc", headers: {} },
      response: {
        status: 403,
        url: "/abc",
        headers: {},
        data: {},
        retryCount: 1,
      },
    });
    request.mockRejectedValueOnce(error);

    await expect(publish(context, options)).rejects.toThrow(error);
    expect(request).toHaveBeenCalledWith(
      "GET /repos/{owner}/{repo}/releases/tags/{tag}",
      {
        owner,
        repo,
        tag,
      },
    );
  });

  it("should throw if octokit returns other error", async () => {
    const error = new Error("Unknown error");
    request.mockRejectedValueOnce(error);

    await expect(publish(context, options)).rejects.toThrow(error);
    expect(request).toHaveBeenCalledWith(
      "GET /repos/{owner}/{repo}/releases/tags/{tag}",
      {
        owner,
        repo,
        tag,
      },
    );
  });

  it("should create a release and make as latest for main package", async () => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner,
        repo,
        options: {
          ...options,
          makeLatestMainPackageOnly: false,
        },
      } as unknown as GitHubContext);
    request.mockRejectedValueOnce(error).mockResolvedValueOnce({
      data: {
        html_url: "release_url",
        id: 1,
        discussion_url: "discussion_url",
      },
    });

    const result = await publish(
      { ...context, package: { ...context.package, main: true } },
      options,
    );

    expect(request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/releases",
      expect.objectContaining({
        owner,
        repo,
        make_latest: "true",
      }),
    );
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Published GitHub release: release_url",
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Created GitHub release discussion: discussion_url",
    });
    expect(result).toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: "release_url",
      id: 1,
      discussion_url: "discussion_url",
    });
  });

  it("should create a draft release when draftRelease is true and no assets", async () => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner,
        repo,
        options: {
          ...options,
          makeLatestMainPackageOnly: true,
          draftRelease: true,
        },
      } as unknown as GitHubContext);
    request.mockRejectedValueOnce(error).mockResolvedValueOnce({
      data: { html_url: "draft_url", id: 1 },
    });

    const result = await publish(context, options);

    expect(request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/releases",
      expect.objectContaining({ draft: true, make_latest: "false" }),
    );
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Created GitHub draft release: draft_url",
    });
    expect(result).toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: "draft_url",
      id: 1,
    });
  });

  it("should publish a release when draftRelease is false and no assets", async () => {
    request.mockRejectedValueOnce(error).mockResolvedValueOnce({
      data: {
        html_url: "release_url",
        id: 1,
        discussion_url: "discussion_url",
      },
    });

    const result = await publish(context, options);

    expect(request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/releases",
      expect.objectContaining({
        owner,
        repo,
      }),
    );
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Published GitHub release: release_url",
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Created GitHub release discussion: discussion_url",
    });
    expect(result).toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: "release_url",
      id: 1,
      discussion_url: "discussion_url",
    });
  });

  it("should publish a release without discussionCategoryName when draftRelease is false and no assets", async () => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner,
        repo,
        options: {
          ...options,
          discussionCategoryName: undefined,
        },
      } as unknown as GitHubContext);
    request.mockRejectedValueOnce(error).mockResolvedValueOnce({
      data: {
        html_url: "release_url",
        id: 1,
        discussion_url: "discussion_url",
      },
    });

    const result = await publish(context, options);

    expect(request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/releases",
      expect.objectContaining({
        owner,
        repo,
      }),
    );
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Published GitHub release: release_url",
    });
    expect(result).toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: "release_url",
      id: 1,
      discussion_url: "discussion_url",
    });
  });

  it("should create a draft release and upload assets when assets are provided", async () => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner,
        repo,
        options: {
          ...options,
          assets: ["asset1", "asset2"],
          draftRelease: true,
        },
      } as unknown as GitHubContext);
    vi.mocked(findUniqueReleaseAssets).mockResolvedValueOnce([
      "asset1",
      "asset2",
    ]);
    request.mockRejectedValueOnce(error).mockResolvedValueOnce({
      data: { upload_url: "upload_url", html_url: "draft_url", id: 1 },
    });

    const result = await publish(context, options);

    expect(request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/releases",
      expect.objectContaining({ draft: true }),
    );
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Created GitHub draft release: draft_url",
    });
    expect(uploadReleaseAsset).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: "draft_url",
      id: 1,
    });
  });

  it("should publish a release after uploading assets when draftRelease is false", async () => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner,
        repo,
        options: {
          ...options,
          assets: ["asset1", "asset2"],
        },
      } as unknown as GitHubContext);
    request
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({
        data: { upload_url: "upload_url", html_url: "draft_url", id: 1 },
      })
      .mockResolvedValueOnce({
        data: { html_url: "release_url", discussion_url: "discussion_url" },
      });

    const result = await publish(context, options);

    expect(request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/releases",
      expect.objectContaining({ draft: true }),
    );
    expect(request).toHaveBeenCalledWith(
      "PATCH /repos/{owner}/{repo}/releases/{release_id}",
      expect.objectContaining({ draft: false }),
    );
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Published GitHub release: release_url",
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Created GitHub release discussion: discussion_url",
    });
    expect(uploadReleaseAsset).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: "release_url",
      id: 1,
      discussion_url: "discussion_url",
    });
  });

  it("should publish a release without discussionCategoryName after uploading assets when draftRelease is false", async () => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner,
        repo,
        options: {
          ...options,
          discussionCategoryName: undefined,
          assets: ["asset1", "asset2"],
        },
      } as unknown as GitHubContext);
    request
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({
        data: { upload_url: "upload_url", html_url: "draft_url", id: 1 },
      })
      .mockResolvedValueOnce({
        data: { html_url: "release_url", discussion_url: "discussion_url" },
      });

    const result = await publish(context, options);

    expect(request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/releases",
      expect.objectContaining({ draft: true }),
    );
    expect(request).toHaveBeenCalledWith(
      "PATCH /repos/{owner}/{repo}/releases/{release_id}",
      expect.objectContaining({ draft: false }),
    );
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Published GitHub release: release_url",
    });
    expect(uploadReleaseAsset).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: "release_url",
      id: 1,
      discussion_url: "discussion_url",
    });
  });
});
