import { GitbeakerRequestError } from "@gitbeaker/requester-utils";
import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { AddChannelsContext, BranchType } from "@lets-release/config";

import { GITLAB_ARTIFACT_NAME } from "src/constants/GITLAB_ARTIFACT_NAME";
import { addChannels } from "src/steps/addChannels";

const url = "https://gitlab.com";

const env = { GITLAB_TOKEN: "gitlab_token" };
const logger = { log: vi.fn() };
const owner = "test_user";
const repo = "test_repo";
const projectId = `${owner}/${repo}`;
const repositoryUrl = `${url}/${owner}/${repo}.git`;
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
const mockCheckRepoPermissions = (mockPool: Interceptable) => {
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

describe("addChannels", () => {
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
    mockCheckRepoPermissions(mockPool);
  });

  afterEach(() => {
    mockPool.close();
    mockAgent.close();
  });

  it("should update a release", async () => {
    mockPool
      .intercept({
        method: "PUT",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/releases/${tag}`,
      })
      .reply(200, {}, responseOptions);

    await expect(
      addChannels(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true },
          package: { name: "pkg" },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as AddChannelsContext,
        { url },
      ),
    ).resolves.toEqual({
      name: GITLAB_ARTIFACT_NAME,
      url: `${url}/${projectId}/-/releases/${encodeURIComponent(tag)}`,
    });

    mockAgent.assertNoPendingInterceptors();
  });

  it("should create the new release if current one is missing", async () => {
    mockPool
      .intercept({
        method: "PUT",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/releases/${tag}`,
      })
      .reply(404, {}, responseOptions);

    mockPool
      .intercept({
        method: "POST",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/releases`,
      })
      .reply(200, {}, responseOptions);

    await expect(
      addChannels(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true },
          package: { name: "pkg" },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as AddChannelsContext,
        { url },
      ),
    ).resolves.toEqual({
      name: GITLAB_ARTIFACT_NAME,
      url: `${url}/${projectId}/-/releases/${encodeURIComponent(tag)}`,
    });

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error if api returns other error", async () => {
    mockPool
      .intercept({
        method: "PUT",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/releases/${tag}`,
      })
      .reply(500, {}, responseOptions);

    await expect(
      addChannels(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true },
          package: { name: "pkg" },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as AddChannelsContext,
        { url },
      ),
    ).rejects.toThrow(GitbeakerRequestError);

    mockAgent.assertNoPendingInterceptors();
  });
});
