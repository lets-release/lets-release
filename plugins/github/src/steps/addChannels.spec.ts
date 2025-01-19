import { RequestError } from "@octokit/request-error";

import { AddChannelsContext, BranchType } from "@lets-release/config";

import { GITHUB_ARTIFACT_NAME } from "src/constants/GITHUB_ARTIFACT_NAME";
import { ensureGitHubContext } from "src/helpers/ensureGitHubContext";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { addChannels } from "src/steps/addChannels";
import { GitHubContext } from "src/types/GitHubContext";

vi.mock("src/LetsReleaseOctokit");
vi.mock("src/helpers/ensureGitHubContext");

const request = vi.fn();
const octokit = { request } as unknown as LetsReleaseOctokit;
const log = vi.fn();
const warn = vi.fn();
const context = {
  options: {},
  branch: { type: BranchType.main },
  nextRelease: { tag: "v1.0.0", notes: "Release notes" },
  logger: { log, warn },
  package: { name: "pkg" },
} as unknown as AddChannelsContext;

vi.mocked(LetsReleaseOctokit).mockReturnValue(octokit);

describe("addChannels", () => {
  beforeEach(() => {
    vi.mocked(ensureGitHubContext)
      .mockReset()
      .mockResolvedValue({
        octokit,
        owner: "owner",
        repo: "repo",
        options: {},
      } as GitHubContext);
    request.mockReset();
    log.mockClear();
    warn.mockClear();
  });

  it("should skip if it is not the main package", async () => {
    vi.mocked(ensureGitHubContext).mockResolvedValue({
      octokit,
      owner: "owner",
      repo: "repo",
      options: { mainPackageOnly: true },
    } as GitHubContext);
    request
      .mockResolvedValueOnce({ data: { id: 123 } }) // GET request
      .mockResolvedValueOnce({
        data: { html_url: "https://github.com/release" },
      }); // PATCH request

    const result = await addChannels(context, {});

    expect(warn).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: "Skip as it is not the main package",
    });
    expect(result).toBeUndefined();
  });

  it("should update an existing release if it exists", async () => {
    request
      .mockResolvedValueOnce({ data: { id: 123 } }) // GET request
      .mockResolvedValueOnce({
        data: { html_url: "https://github.com/release" },
      }); // PATCH request

    const result = await addChannels(context, {});

    expect(request).toHaveBeenNthCalledWith(
      1,
      "GET /repos/{owner}/{repo}/releases/tags/{tag}",
      {
        owner: "owner",
        repo: "repo",
        tag: "v1.0.0",
      },
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "PATCH /repos/{owner}/{repo}/releases/{release_id}",
      {
        owner: "owner",
        repo: "repo",
        name: "v1.0.0",
        prerelease: false,
        tag_name: "v1.0.0",
        release_id: 123,
      },
    );
    expect(log).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: "Updated GitHub release: https://github.com/release",
    });
    expect(result).toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: "https://github.com/release",
      id: 123,
    });
  });

  it("should create a new release if it does not exist", async () => {
    request
      .mockRejectedValueOnce(
        new RequestError("Not Found", 404, {
          request: { method: "POST", url: "/abc", headers: {} },
          response: {
            status: 404,
            url: "/abc",
            headers: {},
            data: {},
            retryCount: 1,
          },
        }),
      ) // GET request
      .mockResolvedValueOnce({
        data: { html_url: "https://github.com/new-release", id: 123 },
      }); // POST request

    const result = await addChannels(context, {});

    expect(request).toHaveBeenNthCalledWith(
      1,
      "GET /repos/{owner}/{repo}/releases/tags/{tag}",
      {
        owner: "owner",
        repo: "repo",
        tag: "v1.0.0",
      },
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "POST /repos/{owner}/{repo}/releases",
      {
        owner: "owner",
        repo: "repo",
        name: "v1.0.0",
        prerelease: false,
        tag_name: "v1.0.0",
        body: "Release notes",
      },
    );
    expect(log).toHaveBeenNthCalledWith(1, {
      prefix: "[pkg]",
      message: "There is no release for tag v1.0.0, creating a new one",
    });
    expect(log).toHaveBeenNthCalledWith(2, {
      prefix: "[pkg]",
      message: "Published GitHub release: https://github.com/new-release",
    });
    expect(result).toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: "https://github.com/new-release",
      id: 123,
    });
  });

  it("should throw an error for other request errors", async () => {
    request.mockRejectedValueOnce(
      new RequestError("Forbidden", 403, {
        request: { method: "POST", url: "/abc", headers: {} },
        response: {
          status: 4043,
          url: "/abc",
          headers: {},
          data: {},
          retryCount: 1,
        },
      }),
    );

    await expect(addChannels(context, {})).rejects.toThrow(RequestError);

    expect(request).toHaveBeenCalledWith(
      "GET /repos/{owner}/{repo}/releases/tags/{tag}",
      {
        owner: "owner",
        repo: "repo",
        tag: "v1.0.0",
      },
    );
  });
});
