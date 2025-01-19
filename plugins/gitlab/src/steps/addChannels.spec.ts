import { GitbeakerRequestError } from "@gitbeaker/requester-utils";
import urlJoin from "url-join";

import { AddChannelsContext } from "@lets-release/config";

import { GITLAB_ARTIFACT_NAME } from "src/constants/GITLAB_ARTIFACT_NAME";
import { ensureGitLabContext } from "src/helpers/ensureGitLabContext";
import { addChannels } from "src/steps/addChannels";
import { GitLabContext } from "src/types/GitLabContext";

vi.mock("url-join");
vi.mock("src/helpers/ensureGitLabContext");

const log = vi.fn();
const warn = vi.fn();
const context = {
  package: { name: "pkg" },
  nextRelease: { tag: "v1.0.0", notes: "Release notes" },
  logger: { log, warn },
} as unknown as AddChannelsContext;
const create = vi.fn();
const edit = vi.fn();
const gitlab = {
  ProjectReleases: {
    edit,
    create,
  },
};
const projectId = "123";
const options = {
  url: "https://gitlab.com",
  milestones: ["milestone1"],
};
const gitLabContext = {
  gitlab,
  projectId,
  options,
} as unknown as GitLabContext;

describe("addChannels", () => {
  beforeEach(() => {
    vi.mocked(urlJoin)
      .mockReset()
      .mockReturnValue("https://gitlab.com/123/-/releases/v1.0.0");
    vi.mocked(ensureGitLabContext).mockReset().mockResolvedValue(gitLabContext);
    log.mockClear();
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

    const result = await addChannels(context, options);

    expect(warn).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: "Skip as it is not the main package",
    });
    expect(result).toBeUndefined();
  });

  it("should update an existing release", async () => {
    await expect(addChannels(context, options)).resolves.toEqual({
      name: GITLAB_ARTIFACT_NAME,
      url: "https://gitlab.com/123/-/releases/v1.0.0",
    });

    expect(edit).toHaveBeenCalledWith(projectId, "v1.0.0", {
      tag_name: "v1.0.0",
      description: "Release notes",
      milestones: ["milestone1"],
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: "Updated GitLab release: v1.0.0",
    });
  });

  it("should update an existing release without release notes", async () => {
    await expect(
      addChannels(
        { ...context, nextRelease: { ...context.nextRelease, notes: " " } },
        options,
      ),
    ).resolves.toEqual({
      name: GITLAB_ARTIFACT_NAME,
      url: "https://gitlab.com/123/-/releases/v1.0.0",
    });

    expect(edit).toHaveBeenCalledWith(projectId, "v1.0.0", {
      tag_name: "v1.0.0",
      milestones: ["milestone1"],
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: "Updated GitLab release: v1.0.0",
    });
  });

  it("should create a new release if the release does not exist", async () => {
    edit.mockRejectedValue(
      new GitbeakerRequestError("Not Found", {
        cause: { response: { status: 404 } as Response },
      } as never),
    );

    await expect(addChannels(context, options)).resolves.toEqual({
      name: GITLAB_ARTIFACT_NAME,
      url: "https://gitlab.com/123/-/releases/v1.0.0",
    });

    expect(create).toHaveBeenCalledWith(projectId, {
      tag_name: "v1.0.0",
      description: "Release notes",
      milestones: ["milestone1"],
    });
    expect(log).toHaveBeenNthCalledWith(1, {
      prefix: "[pkg]",
      message: "There is no release for tag v1.0.0, creating a new one",
    });
    expect(log).toHaveBeenNthCalledWith(2, {
      prefix: "[pkg]",
      message: "Published GitLab release: v1.0.0",
    });
  });

  it("should create a new release without release notes if the release does not exist", async () => {
    edit.mockRejectedValue(
      new GitbeakerRequestError("Not Found", {
        cause: { response: { status: 404 } as Response },
      } as never),
    );

    await expect(
      addChannels(
        { ...context, nextRelease: { ...context.nextRelease, notes: " " } },
        options,
      ),
    ).resolves.toEqual({
      name: GITLAB_ARTIFACT_NAME,
      url: "https://gitlab.com/123/-/releases/v1.0.0",
    });

    expect(create).toHaveBeenCalledWith(projectId, {
      tag_name: "v1.0.0",
      description: "v1.0.0",
      milestones: ["milestone1"],
    });
    expect(log).toHaveBeenNthCalledWith(1, {
      prefix: "[pkg]",
      message: "There is no release for tag v1.0.0, creating a new one",
    });
    expect(log).toHaveBeenNthCalledWith(2, {
      prefix: "[pkg]",
      message: "Published GitLab release: v1.0.0",
    });
  });

  it("should throw an error if the release update fails for reasons other than 404", async () => {
    const error = new GitbeakerRequestError("Internal Server Error", {
      cause: { response: { status: 500 } as Response },
    } as never);
    edit.mockRejectedValue(error);

    await expect(addChannels(context, options)).rejects.toThrow(error);
  });
});
