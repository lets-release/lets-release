import { RequestError } from "@octokit/request-error";

import { FindPackagesContext } from "@lets-release/config";

import { InvalidGitHubTokenError } from "src/errors/InvalidGitHubTokenError";
import { MismatchGitHubUrlError } from "src/errors/MismatchGitHubUrlError";
import { NoGitHubPermissionError } from "src/errors/NoGitHubPermissionError";
import { NoGitHubTokenError } from "src/errors/NoGitHubTokenError";
import { RepoNotFoundError } from "src/errors/RepoNotFoundError";
import { ensureGitHubContext } from "src/helpers/ensureGitHubContext";
import { resolveGitHubOptions } from "src/helpers/resolveGitHubOptions";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { ResolvedGitHubOptions } from "src/schemas/GitHubOptions";

vi.mock("src/helpers/resolveGitHubOptions");
vi.mock("src/LetsReleaseOctokit");

const getPluginContext = vi.fn();
const setPluginContext = vi.fn();
const context = {
  getPluginContext,
  setPluginContext,
  env: {},
  options: { repositoryUrl: "https://github.com/owner/repo" },
} as unknown as FindPackagesContext;
const options = {
  token: "valid-token",
  apiUrl: "https://api.github.com",
  proxy: new URL("https://proxy.com"),
  proxyOptions: {},
} as unknown as ResolvedGitHubOptions;

const request = vi.fn();
const octokit = { request } as unknown as LetsReleaseOctokit;

vi.mocked(LetsReleaseOctokit).mockImplementation(function () {
  return octokit;
});

describe("ensureGitHubContext", () => {
  beforeEach(() => {
    vi.mocked(resolveGitHubOptions).mockReset().mockResolvedValue(options);
    getPluginContext.mockReset();
    request.mockReset();
  });

  it("should return existing GitHub context if it exists", async () => {
    const existingContext = { octokit: {}, owner: "owner", repo: "repo" };
    getPluginContext.mockReturnValue(existingContext);

    const result = await ensureGitHubContext(context, {});

    expect(result).toBe(existingContext);
  });

  it("should throw NoGitHubTokenError if no GitHub token is provided", async () => {
    vi.mocked(resolveGitHubOptions).mockResolvedValue({
      ...options,
      token: "",
    });

    await expect(ensureGitHubContext(context, {})).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(NoGitHubTokenError)],
      }),
    );
  });

  it("should throw InvalidGitHubTokenError if GitHub token is invalid", async () => {
    vi.mocked(resolveGitHubOptions).mockResolvedValue({
      ...options,
      apiUrl: "",
      proxy: false,
    });
    request.mockRejectedValue(
      new RequestError("Unauthorized", 401, {
        request: { method: "POST", url: "/abc", headers: {} },
        response: {
          status: 401,
          url: "/abc",
          headers: {},
          data: {},
          retryCount: 1,
        },
      }),
    );

    await expect(ensureGitHubContext(context, {})).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(InvalidGitHubTokenError)],
      }),
    );
  });

  it("should throw RepoNotFoundError if repository is not found", async () => {
    request.mockRejectedValue(
      new RequestError("Unauthorized", 404, {
        request: { method: "POST", url: "/abc", headers: {} },
        response: {
          status: 401,
          url: "/abc",
          headers: {},
          data: {},
          retryCount: 1,
        },
      }),
    );

    await expect(ensureGitHubContext(context, {})).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(RepoNotFoundError)],
      }),
    );
  });

  it("should throw other error", async () => {
    const error = new Error("Unknown error");
    request.mockRejectedValue(error);

    await expect(ensureGitHubContext(context, options)).rejects.toEqual(
      expect.objectContaining({
        errors: [error],
      }),
    );
  });

  it("should throw MismatchGitHubUrlError if repository URL does not match", async () => {
    request.mockResolvedValue({
      data: {
        permissions: {},
        clone_url: "https://github.com/lets-release/lets-release.git",
      },
    });

    await expect(ensureGitHubContext(context, {})).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(MismatchGitHubUrlError)],
      }),
    );
  });

  it("should throw NoGitHubPermissionError if permissions are insufficient", async () => {
    request
      .mockResolvedValueOnce({
        data: {
          permissions: {},
          clone_url: "https://github.com/owner/repo",
        },
      })
      .mockRejectedValueOnce({});

    await expect(ensureGitHubContext(context, {})).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(NoGitHubPermissionError)],
      }),
    );
  });

  it("should set and return new GitHub context if no errors occur", async () => {
    request.mockResolvedValue({
      data: {
        permissions: { push: true },
        clone_url: "https://github.com/owner/repo",
      },
    });

    const result = await ensureGitHubContext(context, {});

    expect(setPluginContext).toHaveBeenCalledWith(result);
    expect(result).toEqual({
      octokit,
      owner: "owner",
      repo: "repo",
      options,
    });
  });
});
