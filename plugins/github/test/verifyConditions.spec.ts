import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { VerifyConditionsContext } from "@lets-release/config";

import { OCTOKIT_MAX_RETRIES } from "src/constants/OCTOKIT_MAX_RETRIES";
import { InvalidGitHubTokenError } from "src/errors/InvalidGitHubTokenError";
import { NoGitHubPermissionError } from "src/errors/NoGitHubPermissionError";
import { RepoNotFoundError } from "src/errors/RepoNotFoundError";
import { verifyConditions } from "src/steps/verifyConditions";

const apiUrl = "https://api.github.local";

const env = { GITHUB_TOKEN: "github_token" };
const owner = "test_user";
const repo = "test_repo";
const repositoryUrl = `https://github.com/${owner}/${repo}.git`;
const getPluginContext = vi.fn();
const setPluginContext = vi.fn();

const responseOptions = {
  headers: { "Content-Type": "application/json" },
};

describe("verifyConditions", () => {
  let mockAgent: MockAgent;
  let mockPool: Interceptable;

  beforeEach(() => {
    mockAgent = new MockAgent({
      keepAliveTimeout: 10, // milliseconds
      keepAliveMaxTimeout: 10, // milliseconds
    });
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);
    mockPool = mockAgent.get(apiUrl);
  });

  afterEach(async () => {
    await mockPool.close();
    await mockAgent.close();
  });

  it("should verify github api permissions", async () => {
    mockPool
      .intercept({ method: "GET", path: `/repos/${owner}/${repo}` })
      .reply(
        200,
        { clone_url: repositoryUrl, permissions: { push: true } },
        responseOptions,
      );

    await expect(
      verifyConditions(
        {
          env,
          options: { repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { apiUrl },
      ),
    ).resolves.toBeUndefined();

    mockAgent.assertNoPendingInterceptors();
  });

  it("should verify github api permissions with installation token", async () => {
    mockPool
      .intercept({ method: "GET", path: `/repos/${owner}/${repo}` })
      .reply(
        200,
        { clone_url: repositoryUrl, permissions: { push: false } },
        responseOptions,
      );
    mockPool
      .intercept({
        method: "HEAD",
        path: "/installation/repositories?per_page=1",
      })
      .reply(200, "HEAD");

    await expect(
      verifyConditions(
        {
          env,
          options: { repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { apiUrl },
      ),
    ).resolves.toBeUndefined();

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error if token doesn't have the push permission on the repository and it's not a github installation token", async () => {
    mockPool
      .intercept({ method: "GET", path: `/repos/${owner}/${repo}` })
      .reply(
        200,
        { clone_url: repositoryUrl, permissions: { push: false } },
        responseOptions,
      );
    mockPool
      .intercept({
        method: "HEAD",
        path: "/installation/repositories?per_page=1",
      })
      .reply(403, "HEAD");

    await expect(
      verifyConditions(
        {
          env,
          options: { repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { apiUrl },
      ),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(NoGitHubPermissionError)],
      }),
    );

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error for invalid token", async () => {
    mockPool
      .intercept({ method: "GET", path: `/repos/${owner}/${repo}` })
      .reply(401, "Unauthorized");

    await expect(
      verifyConditions(
        {
          env,
          options: { repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { apiUrl },
      ),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(InvalidGitHubTokenError)],
      }),
    );

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error if the repository doesn't exist", async () => {
    mockPool
      .intercept({ method: "GET", path: `/repos/${owner}/${repo}` })
      .reply(404, "Not Found")
      .times(OCTOKIT_MAX_RETRIES + 1);

    await expect(
      verifyConditions(
        {
          env,
          options: { repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { apiUrl },
      ),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(RepoNotFoundError)],
      }),
    );

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error if github return any other errors", async () => {
    mockPool
      .intercept({ method: "GET", path: `/repos/${owner}/${repo}` })
      .reply(500)
      .times(OCTOKIT_MAX_RETRIES + 1);

    await expect(
      verifyConditions(
        {
          env,
          options: { repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { apiUrl },
      ),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(Error)],
      }),
    );

    mockAgent.assertNoPendingInterceptors();
  });
});
