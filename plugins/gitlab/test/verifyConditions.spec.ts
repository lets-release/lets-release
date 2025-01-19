import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { VerifyConditionsContext } from "@lets-release/config";

import { InvalidGitLabTokenError } from "src/errors/InvalidGitLabTokenError";
import { NoGitLabPullPermissionError } from "src/errors/NoGitLabPullPermissionError";
import { NoGitLabPushPermissionError } from "src/errors/NoGitLabPushPermissionError";
import { RepoNotFoundError } from "src/errors/RepoNotFoundError";
import { verifyConditions } from "src/steps/verifyConditions";

const url = "https://gitlab.local";

const env = { GITLAB_TOKEN: "gitlab_token" };
const ciEnv = { service: "gitlab" };
const logger = { log: vi.fn() };
const owner = "test_user";
const repo = "test_repo";
const projectId = `${owner}/${repo}`;
const repositoryUrl = `${url}/${owner}/${repo}.git`;
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
    mockPool = mockAgent.get(url);
  });

  afterEach(() => {
    mockPool.close();
    mockAgent.close();
  });

  it("should verify gitlab api permissions", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}`,
      })
      .reply(
        200,
        {
          permissions: {
            project_access: {
              access_level: 35,
            },
            group_access: {
              access_level: 35,
            },
          },
        },
        responseOptions,
      );

    await expect(
      verifyConditions(
        {
          env,
          ciEnv,
          logger,
          options: { repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { token: "gitlab-token", url },
      ),
    ).resolves.toBeUndefined();

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error if token doesn't have the pull permission", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}`,
      })
      .reply(
        200,
        {
          permissions: {
            project_access: {
              access_level: 5,
            },
            group_access: {
              access_level: 5,
            },
          },
        },
        responseOptions,
      );

    await expect(
      verifyConditions(
        {
          env,
          ciEnv,
          logger,
          options: { dryRun: true, repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { token: "gitlab-token", url },
      ),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(NoGitLabPullPermissionError)],
      }),
    );

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error if token doesn't have the push permission", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}`,
      })
      .reply(
        200,
        {
          permissions: {
            project_access: {
              access_level: 25,
            },
            group_access: {
              access_level: 25,
            },
          },
        },
        responseOptions,
      );

    await expect(
      verifyConditions(
        {
          env,
          ciEnv,
          logger,
          options: { repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { token: "gitlab-token", url },
      ),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(NoGitLabPushPermissionError)],
      }),
    );

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error for invalid token", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}`,
      })
      .reply(401, {}, responseOptions);

    await expect(
      verifyConditions(
        {
          env,
          ciEnv,
          logger,
          options: { repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { token: "gitlab-token", url },
      ),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(InvalidGitLabTokenError)],
      }),
    );

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error if the repository doesn't exist", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}`,
      })
      .reply(404, {}, responseOptions);

    await expect(
      verifyConditions(
        {
          env,
          ciEnv,
          logger,
          options: { repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { token: "gitlab-token", url },
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
      .intercept({
        method: "GET",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}`,
      })
      .reply(500, {}, responseOptions);

    await expect(
      verifyConditions(
        {
          env,
          ciEnv,
          logger,
          options: { repositoryUrl },
          getPluginContext,
          setPluginContext,
        } as unknown as VerifyConditionsContext,
        { token: "gitlab-token", url },
      ),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [expect.any(Error)],
      }),
    );

    mockAgent.assertNoPendingInterceptors();
  });
});
