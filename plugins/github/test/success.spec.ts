/* eslint-disable unicorn/consistent-function-scoping */
import path from "node:path";

import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { BranchType, SuccessContext } from "@lets-release/config";

import { GITHUB_ARTIFACT_NAME } from "src/constants/GITHUB_ARTIFACT_NAME";
import { success } from "src/steps/success";

const apiUrl = "https://api.github.local";

const cwd = path.resolve(import.meta.dirname, "__fixtures__/files");
const env = { GITHUB_TOKEN: "github_token" };
const logger = { log: vi.fn(), error: vi.fn(), warn: vi.fn() };
const owner = "test_user";
const repo = "test_repo";
const repositoryUrl = `https://github.com/${owner}/${repo}.git`;
const commits = [{ hash: "123", message: "feat: commit message" }];
const nextRelease = {
  tag: "v1.0.0",
  hash: "123abc",
  version: "1.0.0",
  notes: "Test release note body",
};
const getPluginContext = vi.fn();
const setPluginContext = vi.fn();
const commentUrl1 = `https://github.com/${owner}/${repo}/issues/1#issuecomment-1`;
const commentUrl2 = `https://github.com/${owner}/${repo}/issues/2#issuecomment-1`;

const responseOptions = {
  headers: { "Content-Type": "application/json" },
};
const mockCheckRepo = (mockPool: Interceptable) => {
  mockPool
    .intercept({ method: "GET", path: `/repos/${owner}/${repo}` })
    .reply(
      200,
      {
        full_name: `${owner}/${repo}`,
        clone_url: repositoryUrl,
        permissions: { push: true },
      },
      responseOptions,
    )
    .times(2);
};

describe("success", () => {
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
    mockCheckRepo(mockPool);
  });

  afterEach(() => {
    mockPool.close();
    mockAgent.close();
  });

  it("should comment on success", async () => {
    const mockGraphQLRequests = (mockPool: Interceptable) => {
      let times = 0;

      mockPool
        .intercept({ method: "POST", path: "/graphql" })
        .reply(
          200,
          () => {
            times += 1;

            if (times === 2) {
              return {
                data: {
                  repository: {
                    commit: {
                      oid: "123",
                      associatedPullRequests: {
                        pageInfo: {
                          endCursor: "B",
                          hasNextPage: false,
                        },
                        nodes: [{ number: 2, body: "close #2" }],
                      },
                    },
                  },
                },
              };
            }

            if (times > 2) {
              return {
                data: {
                  repository: {},
                },
              };
            }

            return {
              data: {
                repository: {
                  commit123: {
                    oid: "123",
                    associatedPullRequests: {
                      pageInfo: {
                        endCursor: "A",
                        hasNextPage: true,
                      },
                      nodes: [{ number: 1, body: "close #1" }],
                    },
                  },
                },
              },
            };
          },
          responseOptions,
        )
        .times(3);
    };
    const mockFilterPRs = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "GET",
          path: `/repos/${owner}/${repo}/pulls/1/commits?page=1&per_page=100`,
        })
        .reply(200, [{ sha: "123" }], responseOptions);

      mockPool
        .intercept({
          method: "GET",
          path: `/repos/${owner}/${repo}/pulls/2/commits?page=1&per_page=100`,
        })
        .reply(200, [{ sha: "456" }], responseOptions);
    };
    const mockGetPRInfo = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "GET",
          path: `/repos/${owner}/${repo}/pulls/2`,
        })
        .reply(200, { merge_commit_sha: "123" }, responseOptions);
    };
    const mockCommentOnIssues = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "POST",
          path: `/repos/${owner}/${repo}/issues/1/comments`,
        })
        .reply(200, { html_url: commentUrl1 }, responseOptions);
      mockPool
        .intercept({
          method: "POST",
          path: `/repos/${owner}/${repo}/issues/2/comments`,
        })
        .reply(200, { html_url: commentUrl2 }, responseOptions);
    };
    const mockAddLabels = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "POST",
          path: `/repos/${owner}/${repo}/issues/1/labels`,
        })
        .reply(200, {}, responseOptions);

      mockPool
        .intercept({
          method: "POST",
          path: `/repos/${owner}/${repo}/issues/2/labels`,
        })
        .reply(200, {}, responseOptions);
    };

    mockGraphQLRequests(mockPool);
    mockFilterPRs(mockPool);
    mockGetPRInfo(mockPool);
    mockCommentOnIssues(mockPool);
    mockAddLabels(mockPool);

    await expect(
      success(
        {
          cwd,
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          commits,
          package: { name: "pkg" },
          nextRelease,
          releases: [],
          getPluginContext,
          setPluginContext,
        } as unknown as SuccessContext,
        { apiUrl, successLabels: ["success"] },
      ),
    ).resolves.toBeUndefined();

    mockAgent.assertNoPendingInterceptors();
  });

  it("should update release notes", async () => {
    const mockUpdateRelease = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "PATCH",
          path: `/repos/${owner}/${repo}/releases/1`,
        })
        .reply(200, {}, responseOptions);
    };

    mockUpdateRelease(mockPool);

    await expect(
      success(
        {
          cwd,
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          commits: [],
          package: { name: "pkg" },
          nextRelease,
          releases: [
            {
              tag: nextRelease.tag,
              artifacts: [
                { name: GITHUB_ARTIFACT_NAME, id: 1 },
                { name: "other", id: 2 },
              ],
            },
          ],
          getPluginContext,
          setPluginContext,
        } as unknown as SuccessContext,
        { apiUrl, positionOfOtherArtifacts: "bottom" },
      ),
    ).resolves.toBeUndefined();

    mockAgent.assertNoPendingInterceptors();
  });
});
