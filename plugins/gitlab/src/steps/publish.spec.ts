import { GitbeakerRequestError } from "@gitbeaker/requester-utils";
import urlJoin from "url-join";

import { PublishContext } from "@lets-release/config";

import { GITLAB_ARTIFACT_NAME } from "src/constants/GITLAB_ARTIFACT_NAME";
import { AssetTarget } from "src/enums/AssetTarget";
import { AssetType } from "src/enums/AssetType";
import { GenericPackageStatus } from "src/enums/GenericPackageStatus";
import { ensureGitLabContext } from "src/helpers/ensureGitLabContext";
import { uploadReleaseAsset } from "src/helpers/uploadReleaseAsset";
import { publish } from "src/steps/publish";
import { GitLabContext } from "src/types/GitLabContext";

vi.mock("url-join");
vi.mock("src/helpers/ensureGitLabContext");
vi.mock("src/helpers/uploadReleaseAsset");

const log = vi.fn();
const warn = vi.fn();
const error = vi.fn();
const tag = "v1.0.0";
const context = {
  cwd: "/path/to/repo",
  repositoryRoot: "/path/to/repo",
  nextRelease: { tag, hash: "abc123", notes: "Release notes" },
  logger: { log, warn, error },
  package: {
    uniqueName: "npm/pkg",
  },
} as unknown as PublishContext;
const options = {};
const show = vi.fn();
const create = vi.fn();
const gitLabContext = {
  gitlab: { ProjectReleases: { show, create } },
  projectId: "123",
  options: {
    url: "https://gitlab.com",
    assets: [
      "test.txt",
      {
        type: AssetType.Other,
        target: AssetTarget.ProjectUpload,
        status: GenericPackageStatus.Default,
        path: "test2.txt",
      },
      {
        type: AssetType.Other,
        target: AssetTarget.ProjectUpload,
        status: GenericPackageStatus.Default,
        url: "https://example.com/asset",
      },
    ],
    milestones: [],
  },
} as unknown as GitLabContext;

const gitlabError = new GitbeakerRequestError("Not Found", {
  cause: { response: { status: 404 } },
} as never);

describe("publish", () => {
  beforeEach(() => {
    vi.mocked(urlJoin)
      .mockReset()
      .mockReturnValue("https://gitlab.com/123/-/releases/v1.0.0");
    vi.mocked(ensureGitLabContext).mockReset().mockResolvedValue(gitLabContext);
    vi.mocked(uploadReleaseAsset).mockResolvedValue([
      {
        name: "artifact1",
        link_type: AssetType.Other,
        url: "https://example.com/asset",
      },
    ]);
    show.mockReset();
    create.mockReset();
    log.mockClear();
    error.mockClear();
  });

  it("should skip if it is not the main package", async () => {
    vi.mocked(ensureGitLabContext)
      .mockReset()
      .mockResolvedValue({
        ...gitLabContext,
        options: {
          ...options,
          mainPackageOnly: true,
        },
      } as unknown as GitLabContext);

    const result = await publish(context, options);

    expect(warn).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Skip as it is not the main package",
    });
    expect(result).toBeUndefined();
  });

  it("should skip if already published", async () => {
    const result = await publish(context, options);

    expect(warn).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: `Skip publishing as tag ${tag} is already published`,
    });
    expect(result).toBeUndefined();
  });

  it("should throw if octokit returns not 404 error", async () => {
    const error = new GitbeakerRequestError("Forbidden", {
      cause: { response: { status: 403 } },
    } as never);
    show.mockRejectedValueOnce(error);

    await expect(publish(context, options)).rejects.toThrow(error);
  });

  it("should throw if octokit returns other error", async () => {
    const error = new Error("Unknown error");
    show.mockRejectedValueOnce(error);

    await expect(publish(context, options)).rejects.toThrow(error);
  });

  it("should create a release with assets", async () => {
    show.mockRejectedValueOnce(gitlabError);

    await publish(context, options);

    expect(create).toHaveBeenCalledWith("123", {
      tag_name: "v1.0.0",
      description: "Release notes",
      milestones: [],
      assets: {
        links: [
          {
            name: "artifact1",
            link_type: AssetType.Other,
            url: "https://example.com/asset",
          },
          {
            name: "artifact1",
            link_type: AssetType.Other,
            url: "https://example.com/asset",
          },
          {
            name: "artifact1",
            link_type: AssetType.Other,
            url: "https://example.com/asset",
          },
        ],
      },
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Published GitLab release: v1.0.0",
    });
  });

  it("should create a release without assets", async () => {
    vi.mocked(ensureGitLabContext).mockResolvedValue({
      ...gitLabContext,
      options: { ...gitLabContext.options, assets: undefined },
    });
    show.mockRejectedValueOnce(gitlabError);

    await publish(
      { ...context, nextRelease: { ...context.nextRelease, notes: " " } },
      options,
    );

    expect(create).toHaveBeenCalledWith("123", {
      tag_name: "v1.0.0",
      description: "v1.0.0",
      milestones: [],
      assets: {
        links: [],
      },
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Published GitLab release: v1.0.0",
    });
  });

  it("should handle errors when creating a release", async () => {
    const e = new Error("API error");
    show.mockRejectedValueOnce(gitlabError);
    create.mockRejectedValue(e);

    await expect(publish(context, options)).rejects.toThrow(e);

    expect(error).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: [
        "An error occurred while making a request to the GitLab release API:\n%O",
        e,
      ],
    });
  });

  it("should return the correct release URL", async () => {
    show.mockRejectedValueOnce(gitlabError);

    const result = await publish(context, options);

    expect(result).toEqual({
      name: GITLAB_ARTIFACT_NAME,
      url: "https://gitlab.com/123/-/releases/v1.0.0",
    });
  });
});
