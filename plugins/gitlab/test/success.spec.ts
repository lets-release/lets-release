/* eslint-disable unicorn/consistent-function-scoping */
import path from "node:path";

import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { BranchType, SuccessContext } from "@lets-release/config";

import { GITLAB_ARTIFACT_NAME } from "src/constants/GITLAB_ARTIFACT_NAME";
import { success } from "src/steps/success";

const url = "https://gitlab.com";

const cwd = path.resolve(import.meta.dirname, "__fixtures__/files");
const env = { GITLAB_TOKEN: "gitlab_token" };
const logger = { log: vi.fn(), error: vi.fn(), warn: vi.fn() };
const owner = "test_user";
const repo = "test_repo";
const projectId = `${owner}/${repo}`;
const repositoryUrl = `${url}/${owner}/${repo}.git`;
const commits = [{ hash: "123", message: "feat: commit message, Close #1" }];
const tag = "v1.0.0";
const nextRelease = {
  tag,
  hash: "123abc",
  version: "1.0.0",
  notes: "Test release note body",
};
const getPluginContext = vi.fn();
const setPluginContext = vi.fn();

const responseOptions = {
  headers: { "Content-Type": "application/json" },
};
const mockCheckRepo = (mockPool: Interceptable) => {
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
    mockPool = mockAgent.get(url);
    mockCheckRepo(mockPool);
  });

  afterEach(() => {
    mockPool.close();
    mockAgent.close();
  });

  it("should comment on success", async () => {
    const mockGetMRs = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "GET",
          path: `/api/v4/projects/${encodeURIComponent(projectId)}/repository/commits/123/merge_requests?page=1&per_page=100`,
        })
        .reply(
          200,
          [
            {
              project_id: projectId,
              iid: 1,
              state: "merged",
              isMergeRequest: true,
            },
          ],
          responseOptions,
        );
    };

    const mockGetIssues = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "GET",
          path: `/api/v4/projects/${encodeURIComponent(projectId)}/merge_requests/1/closes_issues`,
        })
        .reply(
          200,
          [
            {
              project_id: projectId,
              iid: 1,
              state: "closed",
            },
          ],
          responseOptions,
        );
    };

    const mockFindIssues = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "GET",
          path: `/api/v4/projects/${encodeURIComponent(projectId)}/issues?page=1&per_page=100&iids[]=1`,
        })
        .reply(
          200,
          [
            {
              project_id: projectId,
              iid: 1,
              state: "closed",
            },
          ],
          responseOptions,
        );
    };

    const mockAddCommentToMRs = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "POST",
          path: `/api/v4/projects/${encodeURIComponent(projectId)}/merge_requests/1/notes`,
        })
        .reply(200, {}, responseOptions);
    };

    const mockAddCommentToIssues = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "POST",
          path: `/api/v4/projects/${encodeURIComponent(projectId)}/issues/1/notes`,
        })
        .reply(200, {}, responseOptions);
    };

    const mockAddMRLabels = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "PUT",
          path: `/api/v4/projects/${encodeURIComponent(projectId)}/merge_requests/1`,
        })
        .reply(200, {}, responseOptions);
    };

    const mockAddIssueLabels = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "PUT",
          path: `/api/v4/projects/${encodeURIComponent(projectId)}/issues/1`,
        })
        .reply(200, {}, responseOptions);
    };

    mockGetMRs(mockPool);
    mockGetIssues(mockPool);
    mockFindIssues(mockPool);
    mockAddCommentToMRs(mockPool);
    mockAddCommentToIssues(mockPool);
    mockAddMRLabels(mockPool);
    mockAddIssueLabels(mockPool);

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
        { url, successLabels: ["success"] },
      ),
    ).resolves.toBeUndefined();

    mockAgent.assertNoPendingInterceptors();
  });

  it("should update release notes", async () => {
    const mockUpdateRelease = (mockPool: Interceptable) => {
      mockPool
        .intercept({
          method: "PUT",
          path: `/api/v4/projects/${encodeURIComponent(projectId)}/releases/${tag}`,
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
                { name: GITLAB_ARTIFACT_NAME, id: 1 },
                { name: "other", id: 2 },
              ],
            },
          ],
          getPluginContext,
          setPluginContext,
        } as unknown as SuccessContext,
        { url, positionOfOtherArtifacts: "bottom" },
      ),
    ).resolves.toBeUndefined();

    mockAgent.assertNoPendingInterceptors();
  });
});
