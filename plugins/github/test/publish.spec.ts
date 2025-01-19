import path from "node:path";

import { RequestError } from "@octokit/request-error";
import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { BranchType, PublishContext } from "@lets-release/config";

import { GITHUB_ARTIFACT_NAME } from "src/constants/GITHUB_ARTIFACT_NAME";
import { OCTOKIT_MAX_RETRIES } from "src/constants/OCTOKIT_MAX_RETRIES";
import { publish } from "src/steps/publish";

const apiUrl = "https://api.github.local";

const cwd = path.resolve(import.meta.dirname, "__fixtures__/files");
const env = { GITHUB_TOKEN: "github_token" };
const logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };
const owner = "test_user";
const repo = "test_repo";
const repositoryUrl = `https://github.com/${owner}/${repo}.git`;
const tag = "v1.0.0";
const nextRelease = {
  tag,
  hash: "123abc",
  version: "1.0.0",
  notes: "Test release note body",
};
const getPluginContext = vi.fn();
const setPluginContext = vi.fn();
const releaseUrl = `https://github.com/${owner}/${repo}/releases/${nextRelease.version}`;
const releaseId = 1;
const discussionUrl = `https://github.com/${owner}/${repo}/discussions/1`;
const uploadUrl = `${apiUrl}/repos/${owner}/${repo}/releases/${releaseId}/assets{?name,label}`;
const assetUrl = `https://github.com/${owner}/${repo}/releases/download/${nextRelease.version}/upload.txt`;

const responseOptions = {
  headers: { "Content-Type": "application/json" },
};
const mockCheckRepoPermissions = (mockPool: Interceptable) => {
  mockPool
    .intercept({ method: "GET", path: `/repos/${owner}/${repo}` })
    .reply(
      200,
      { clone_url: repositoryUrl, permissions: { push: true } },
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
    mockPool = mockAgent.get(apiUrl);
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
        path: `/repos/${owner}/${repo}/releases/tags/${tag}`,
      })
      .reply(200, {}, responseOptions);

    await expect(
      publish(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          package: { name: "pkg" },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as PublishContext,
        { apiUrl, draftRelease: true },
      ),
    ).resolves.toBeUndefined();

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error if api returns other error", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/repos/${owner}/${repo}/releases/tags/${tag}`,
      })
      .reply(500, {}, responseOptions)
      .times(OCTOKIT_MAX_RETRIES + 1);

    await expect(
      publish(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          package: { name: "pkg" },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as PublishContext,
        { apiUrl, draftRelease: true },
      ),
    ).rejects.toThrow(RequestError);

    mockAgent.assertNoPendingInterceptors();
  });

  it("should publish a draft release without assets", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/repos/${owner}/${repo}/releases/tags/${tag}`,
      })
      .reply(404, {}, responseOptions)
      .times(OCTOKIT_MAX_RETRIES + 1);
    mockPool
      .intercept({ method: "POST", path: `/repos/${owner}/${repo}/releases` })
      .reply(200, { html_url: releaseUrl, id: releaseId }, responseOptions);

    await expect(
      publish(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          package: { name: "pkg" },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as PublishContext,
        { apiUrl, draftRelease: true },
      ),
    ).resolves.toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: releaseUrl,
      id: releaseId,
    });

    mockAgent.assertNoPendingInterceptors();
  });

  it("should publish a release without assets", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/repos/${owner}/${repo}/releases/tags/${tag}`,
      })
      .reply(404, {}, responseOptions)
      .times(OCTOKIT_MAX_RETRIES + 1);
    mockPool
      .intercept({ method: "POST", path: `/repos/${owner}/${repo}/releases` })
      .reply(
        200,
        { html_url: releaseUrl, id: releaseId, discussion_url: discussionUrl },
        responseOptions,
      );

    await expect(
      publish(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          package: { name: "pkg" },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as PublishContext,
        { apiUrl },
      ),
    ).resolves.toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: releaseUrl,
      id: releaseId,
      discussion_url: discussionUrl,
    });

    mockAgent.assertNoPendingInterceptors();
  });

  it("should publish a draft release with assets", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/repos/${owner}/${repo}/releases/tags/${tag}`,
      })
      .reply(404, {}, responseOptions)
      .times(OCTOKIT_MAX_RETRIES + 1);
    mockPool
      .intercept({
        method: "POST",
        path: `/repos/${owner}/${repo}/releases`,
      })
      .reply(
        200,
        {
          upload_url: uploadUrl,
          html_url: releaseUrl,
          id: releaseId,
        },
        responseOptions,
      );
    mockPool
      .intercept({
        method: "POST",
        path: "/repos/test_user/test_repo/releases/1/assets?name=upload.txt&",
      })
      .reply(
        200,
        {
          browser_download_url: assetUrl,
        },
        responseOptions,
      );

    await expect(
      publish(
        {
          cwd,
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          package: { name: "pkg" },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as PublishContext,
        {
          apiUrl,
          draftRelease: true,
          assets: ["upload.txt"],
        },
      ),
    ).resolves.toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: releaseUrl,
      id: releaseId,
    });

    mockAgent.assertNoPendingInterceptors();
  });

  it("should publish a release with assets", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/repos/${owner}/${repo}/releases/tags/${tag}`,
      })
      .reply(404, {}, responseOptions)
      .times(OCTOKIT_MAX_RETRIES + 1);
    mockPool
      .intercept({
        method: "POST",
        path: `/repos/${owner}/${repo}/releases`,
      })
      .reply(
        200,
        {
          upload_url: uploadUrl,
          html_url: releaseUrl,
          id: releaseId,
        },
        responseOptions,
      );
    mockPool
      .intercept({
        method: "POST",
        path: "/repos/test_user/test_repo/releases/1/assets?name=upload.txt&",
      })
      .reply(
        200,
        {
          browser_download_url: assetUrl,
        },
        responseOptions,
      );
    mockPool
      .intercept({
        method: "PATCH",
        path: `/repos/${owner}/${repo}/releases/${releaseId}`,
      })
      .reply(
        200,
        {
          html_url: releaseUrl,
          discussion_url: discussionUrl,
        },
        responseOptions,
      );

    await expect(
      publish(
        {
          cwd,
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true, name: "main" },
          package: { name: "pkg" },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as PublishContext,
        {
          apiUrl,
          assets: ["upload.txt"],
        },
      ),
    ).resolves.toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: releaseUrl,
      id: releaseId,
      discussion_url: discussionUrl,
    });

    mockAgent.assertNoPendingInterceptors();
  });
});
