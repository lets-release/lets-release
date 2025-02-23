import { RequestError } from "@octokit/request-error";
import { Interceptable, MockAgent, setGlobalDispatcher } from "undici";

import { AddChannelsContext, BranchType } from "@lets-release/config";

import { GITHUB_ARTIFACT_NAME } from "src/constants/GITHUB_ARTIFACT_NAME";
import { OCTOKIT_MAX_RETRIES } from "src/constants/OCTOKIT_MAX_RETRIES";
import { addChannels } from "src/steps/addChannels";

const apiUrl = "https://api.github.local";

const env = { GITHUB_TOKEN: "github_token" };
const logger = { log: vi.fn() };
const owner = "test_user";
const repo = "test_repo";
const repositoryUrl = `https://github.com/${owner}/${repo}.git`;
const nextRelease = {
  tag: "v1.0.0",
  hash: "123abc",
  version: "1.0.0",
  notes: "Test release note body",
};
const getPluginContext = vi.fn();
const setPluginContext = vi.fn();
const releaseUrl = `https://github.com/${owner}/${repo}/releases/${nextRelease.version}`;
const releaseId = 1;

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
    mockPool = mockAgent.get(apiUrl);
    mockCheckRepoPermissions(mockPool);
  });

  afterEach(() => {
    mockPool.close();
    mockAgent.close();
  });

  it("should update a release", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/repos/${owner}/${repo}/releases/tags/${nextRelease.tag}`,
      })
      .reply(200, { id: releaseId }, responseOptions);
    mockPool
      .intercept({
        method: "PATCH",
        path: `/repos/${owner}/${repo}/releases/${releaseId}`,
      })
      .reply(200, { html_url: releaseUrl }, responseOptions);

    await expect(
      addChannels(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true },
          package: {
            uniqueName: "npm/pkg",
          },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as AddChannelsContext,
        { apiUrl },
      ),
    ).resolves.toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: releaseUrl,
      id: releaseId,
    });

    mockAgent.assertNoPendingInterceptors();
  });

  it("should update a prerelease", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/repos/${owner}/${repo}/releases/tags/${nextRelease.tag}`,
      })
      .reply(200, { id: releaseId }, responseOptions);
    mockPool
      .intercept({
        method: "PATCH",
        path: `/repos/${owner}/${repo}/releases/${releaseId}`,
      })
      .reply(200, { html_url: releaseUrl }, responseOptions);

    await expect(
      addChannels(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.prerelease },
          package: {
            uniqueName: "npm/pkg",
          },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as AddChannelsContext,
        { apiUrl },
      ),
    ).resolves.toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: releaseUrl,
      id: releaseId,
    });

    mockAgent.assertNoPendingInterceptors();
  });

  it("should create the new release if current one is missing", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/repos/${owner}/${repo}/releases/tags/${nextRelease.tag}`,
      })
      .reply(404, {}, responseOptions)
      .times(OCTOKIT_MAX_RETRIES + 1);
    mockPool
      .intercept({
        method: "POST",
        path: `/repos/${owner}/${repo}/releases`,
      })
      .reply(200, { html_url: releaseUrl, id: releaseId }, responseOptions);

    await expect(
      addChannels(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true },
          package: {
            uniqueName: "npm/pkg",
          },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as AddChannelsContext,
        { apiUrl },
      ),
    ).resolves.toEqual({
      name: GITHUB_ARTIFACT_NAME,
      url: releaseUrl,
      id: releaseId,
    });

    mockAgent.assertNoPendingInterceptors();
  });

  it("should throw error if api returns other error", async () => {
    mockPool
      .intercept({
        method: "GET",
        path: `/repos/${owner}/${repo}/releases/tags/${nextRelease.tag}`,
      })
      .reply(500, {}, responseOptions)
      .times(OCTOKIT_MAX_RETRIES + 1);

    await expect(
      addChannels(
        {
          env,
          logger,
          options: { repositoryUrl },
          branch: { type: BranchType.main, main: true },
          package: {
            uniqueName: "npm/pkg",
          },
          nextRelease,
          getPluginContext,
          setPluginContext,
        } as unknown as AddChannelsContext,
        { apiUrl },
      ),
    ).rejects.toThrow(RequestError);

    mockAgent.assertNoPendingInterceptors();
  });
});
