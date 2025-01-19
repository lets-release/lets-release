import { Gitlab as TypeGitlab } from "@gitbeaker/core";
import { GitbeakerRequestError } from "@gitbeaker/requester-utils";
import { Gitlab } from "@gitbeaker/rest";

import {
  AnalyzeCommitsContext,
  FindPackagesContext,
} from "@lets-release/config";

import { InvalidGitLabTokenError } from "src/errors/InvalidGitLabTokenError";
import { NoGitLabPullPermissionError } from "src/errors/NoGitLabPullPermissionError";
import { NoGitLabPushPermissionError } from "src/errors/NoGitLabPushPermissionError";
import { NoGitLabTokenError } from "src/errors/NoGitLabTokenError";
import { RepoNotFoundError } from "src/errors/RepoNotFoundError";
import { ensureGitLabContext } from "src/helpers/ensureGitLabContext";
import { parseGitLabUrl } from "src/helpers/parseGitLabUrl";
import { resolveGitLabOptions } from "src/helpers/resolveGitLabOptions";
import { ResolvedGitLabOptions } from "src/schemas/GitLabOptions";

vi.mock("@gitbeaker/rest");
vi.mock("src/helpers/generateFetchFunction");
vi.mock("src/helpers/parseGitLabUrl");
vi.mock("src/helpers/resolveGitLabOptions");

const token = "token";
const url = "https://gitlab.com";
const owner = "owner";
const repo = "repo";
const projectId = `${owner}/${repo}`;
const getPluginContext = vi.fn();
const setPluginContext = vi.fn();
const log = vi.fn();
const context = {
  getPluginContext,
  setPluginContext,
  env: {},
  ciEnv: {},
  logger: { log },
  options: { dryRun: true },
} as unknown as FindPackagesContext;
const options = {
  token,
  url,
  proxy: new URL("https://proxy.com"),
} as unknown as ResolvedGitLabOptions;
const show = vi.fn();
const gitlab = { Projects: { show } } as unknown as TypeGitlab;

vi.mocked(Gitlab).mockReturnValue(gitlab);

describe("ensureGitLabContext", () => {
  beforeEach(() => {
    vi.mocked(parseGitLabUrl).mockReset().mockReturnValue({ owner, repo });
    vi.mocked(resolveGitLabOptions).mockReset().mockResolvedValue(options);
    getPluginContext.mockReset();
  });

  it("should return existing GitLab context if it exists", async () => {
    const existingContext = {
      gitlab,
      owner,
      repo,
      projectId,
      options,
    };
    getPluginContext.mockReturnValue(existingContext);

    const result = await ensureGitLabContext(context, {});

    expect(result).toBe(existingContext);
  });

  it("should throw NoGitLabTokenError if no token is provided", async () => {
    const optionsWithoutToken = {
      ...options,
      token: undefined,
      oauthToken: undefined,
      jobToken: undefined,
    };
    vi.mocked(resolveGitLabOptions).mockResolvedValue(optionsWithoutToken);

    await expect(ensureGitLabContext(context, {})).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(NoGitLabTokenError)],
      }),
    );
  });

  it("should throw InvalidGitLabTokenError if authentication fails with 401", async () => {
    const optionsWithoutProxy = {
      ...options,
      proxy: false,
    } as unknown as ResolvedGitLabOptions;
    vi.mocked(resolveGitLabOptions).mockResolvedValue(optionsWithoutProxy);
    show.mockRejectedValue(
      new GitbeakerRequestError("Unauthorized", {
        cause: { response: { status: 401 } },
      } as never),
    );

    await expect(ensureGitLabContext(context, {})).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(InvalidGitLabTokenError)],
      }),
    );
  });

  it("should throw RepoNotFoundError if repository is not found with 404", async () => {
    show.mockRejectedValue(
      new GitbeakerRequestError("Not Found", {
        cause: { response: { status: 404 } },
      } as never),
    );

    await expect(ensureGitLabContext(context, {})).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(RepoNotFoundError)],
      }),
    );
  });

  it("should throw other gitlab error", async () => {
    const error = new GitbeakerRequestError("Internal Server Error", {
      cause: { response: { status: 500 } },
    } as never);

    show.mockRejectedValue(error);

    await expect(ensureGitLabContext(context, {})).rejects.toEqual(
      expect.objectContaining({
        errors: [error],
      }),
    );
  });

  it("should throw NoGitLabPullPermissionError if dryRun and no pull permission", async () => {
    show.mockResolvedValue({
      permissions: {
        project_access: { access_level: 5 },
        group_access: { access_level: 5 },
      },
    });

    await expect(ensureGitLabContext(context, {})).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(NoGitLabPullPermissionError)],
      }),
    );
  });

  it("should throw NoGitLabPushPermissionError if no push permission", async () => {
    show.mockResolvedValue({
      permissions: {
        project_access: { access_level: 15 },
        group_access: { access_level: 15 },
      },
    });

    await expect(ensureGitLabContext(context, {})).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(NoGitLabPushPermissionError)],
      }),
    );
  });

  it("should set and return new GitLab context", async () => {
    show.mockResolvedValue({
      permissions: {
        project_access: { access_level: 40 },
        group_access: { access_level: 40 },
      },
    });

    const result = await ensureGitLabContext(context, {});

    expect(setPluginContext).toHaveBeenCalledWith(result);
    expect(result).toHaveProperty("gitlab");
    expect(result).toHaveProperty("owner");
    expect(result).toHaveProperty("repo");
    expect(result).toHaveProperty("projectId");
    expect(result).toHaveProperty("options");
  });

  it("should set and return new GitLab context with package", async () => {
    show.mockResolvedValue({
      permissions: {
        project_access: { access_level: 40 },
        group_access: { access_level: 40 },
      },
    });

    const result = await ensureGitLabContext(
      { ...context, package: { name: "pkg" } } as AnalyzeCommitsContext,
      {},
    );

    expect(setPluginContext).toHaveBeenCalledWith(result);
    expect(result).toHaveProperty("gitlab");
    expect(result).toHaveProperty("owner");
    expect(result).toHaveProperty("repo");
    expect(result).toHaveProperty("projectId");
    expect(result).toHaveProperty("options");
  });
});
