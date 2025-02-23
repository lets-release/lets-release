import path from "node:path";

import { GitbeakerRequestError } from "@gitbeaker/requester-utils";
import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { BranchType, PublishContext } from "@lets-release/config";

import { GITLAB_ARTIFACT_NAME } from "src/constants/GITLAB_ARTIFACT_NAME";
import { AssetTarget } from "src/enums/AssetTarget";
import { publish } from "src/steps/publish";

const url = "https://gitlab.com";

const cwd = path.resolve(import.meta.dirname, "__fixtures__/files");
const env = { GITLAB_TOKEN: "gitlab_token" };
const logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };
const owner = "test_user";
const repo = "test_repo";
const projectId = `${owner}/${repo}`;
const repositoryUrl = `${url}/${owner}/${repo}.git`;
const version = "1.0.0";
const tag = `v${version}`;
const nextRelease = {
  tag,
  hash: "123abc",
  version,
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

describe("publish", () => {
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

  it("should skip publishing if already published", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tag)}`,
      })
      .reply(200, {}, responseOptions);

    await expect(
      publish(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          package: {
            uniqueName: "npm/pkg",
          },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as PublishContext,
        { url },
      ),
    ).resolves.toBeUndefined();

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error if api returns other error", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tag)}`,
      })
      .reply(500, {}, responseOptions);

    await expect(
      publish(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          package: {
            uniqueName: "npm/pkg",
          },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as PublishContext,
        { url },
      ),
    ).rejects.toThrow(GitbeakerRequestError);

    mockAgent.assertNoPendingInterceptors();
  });

  it("should publish a release without assets", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tag)}`,
      })
      .reply(404, {}, responseOptions);

    mockPool
      .intercept({
        method: "POST",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/releases`,
      })
      .reply(200, {}, responseOptions);

    await expect(
      publish(
        {
          env,
          logger,
          repositoryRoot: cwd,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          package: {
            uniqueName: "npm/pkg",
          },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as PublishContext,
        { url },
      ),
    ).resolves.toEqual({
      name: GITLAB_ARTIFACT_NAME,
      url: `${url}/${projectId}/-/releases/${encodeURIComponent(tag)}`,
    });

    mockAgent.assertNoPendingInterceptors();
  });

  it("should publish a release with assets", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/releases/${encodeURIComponent(tag)}`,
      })
      .reply(404, {}, responseOptions);

    mockPool
      .intercept({
        method: "POST",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/releases`,
      })
      .reply(200, {}, responseOptions);

    mockPool
      .intercept({
        method: "POST",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/uploads`,
      })
      .reply(200, {}, responseOptions);

    mockPool
      .intercept({
        method: "PUT",
        path: `/api/v4/projects/${encodeURIComponent(projectId)}/packages/generic/release/${version}/package.txt`,
      })
      .reply(200, {}, responseOptions);

    await expect(
      publish(
        {
          cwd,
          env,
          logger,
          repositoryRoot: cwd,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          package: {
            uniqueName: "npm/pkg",
          },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as PublishContext,
        {
          url,
          assets: [
            "upload.txt",
            { path: "package.txt", target: AssetTarget.GenericPackage },
          ],
        },
      ),
    ).resolves.toEqual({
      name: GITLAB_ARTIFACT_NAME,
      url: `${url}/${projectId}/-/releases/${encodeURIComponent(tag)}`,
    });

    mockAgent.assertNoPendingInterceptors();
  });
});
