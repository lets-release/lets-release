import { BaseContext } from "@lets-release/config";

import { resolveGitLabOptions } from "src/helpers/resolveGitLabOptions";
import { GitLabOptions } from "src/schemas/GitLabOptions";

const defaultOptions = {
  mainPackageOnly: false,
  commentOnSuccess: true,
  releaseBodyTemplate: "${nextRelease.notes}",
  releaseNameTemplate: "${nextRelease.tag}",
};

describe("resolveGitLabOptions", () => {
  it("should resolve options with provided values", async () => {
    const context = {
      env: {
        GL_TOKEN: "gl_token",
        GITLAB_TOKEN: "gitlab_token",
        CI_JOB_TOKEN: "ci_job_token",
        CI_SERVER_URL: "https://gitlab.com",
        CI_API_V4_URL: "https://gitlab.com/api/v4",
        http_proxy: "http_proxy",
        HTTP_PROXY: "HTTP_PROXY",
      },
      options: {
        repositoryUrl: "https://gitlab.com/repo",
      },
    } as unknown as BaseContext;

    const options: GitLabOptions = {
      token: "provided_token",
      jobToken: "provided_job_token",
      url: "https://provided.gitlab.com",
      apiUrl: "https://provided.gitlab.com/api/v4",
      proxy: "provided_proxy",
    };

    const result = await resolveGitLabOptions(context, options);

    expect(result).toEqual({
      ...defaultOptions,
      token: "provided_token",
      jobToken: "provided_job_token",
      url: "https://provided.gitlab.com",
      apiUrl: "https://provided.gitlab.com/api/v4",
      proxy: "provided_proxy",
    });
  });

  it("should resolve options with environment variables", async () => {
    const context = {
      env: {
        GL_TOKEN: "gl_token",
        GITLAB_TOKEN: "gitlab_token",
        CI_JOB_TOKEN: "ci_job_token",
        CI_SERVER_URL: "https://gitlab.com",
        CI_API_V4_URL: "https://gitlab.com/api/v4",
        http_proxy: "http_proxy",
        HTTP_PROXY: "HTTP_PROXY",
      },
      options: {
        repositoryUrl: "https://gitlab.com/repo",
      },
    } as unknown as BaseContext;

    const options: GitLabOptions = {};

    const result = await resolveGitLabOptions(context, options);

    expect(result).toEqual({
      ...defaultOptions,
      token: "gl_token",
      jobToken: "ci_job_token",
      url: "https://gitlab.com",
      apiUrl: "https://gitlab.com/api/v4",
      proxy: "http_proxy",
    });
  });

  it("should resolve options with default values", async () => {
    const context = {
      env: {},
      options: {
        repositoryUrl: "https://gitlab.com/repo",
      },
    } as unknown as BaseContext;

    const options: GitLabOptions = {};

    const result = await resolveGitLabOptions(context, options);

    expect(result).toEqual({
      ...defaultOptions,
      token: undefined,
      jobToken: undefined,
      url: "https://gitlab.com",
      apiUrl: undefined,
      proxy: false,
    });
  });
});
