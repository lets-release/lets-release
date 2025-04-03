/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { isNil } from "lodash-es";

import { BaseContext } from "@lets-release/config";
import { getGitHostUrl } from "@lets-release/git-host";

import {
  GitLabOptions,
  ResolvedGitLabOptions,
} from "src/schemas/GitLabOptions";

export async function resolveGitLabOptions(
  {
    env: {
      GL_TOKEN,
      GITLAB_TOKEN,
      CI_JOB_TOKEN,
      CI_SERVER_URL,
      CI_API_V4_URL,
      http_proxy,
      HTTP_PROXY,
    },
    options: { repositoryUrl },
  }: Pick<BaseContext, "env" | "options">,
  options: GitLabOptions,
): Promise<ResolvedGitLabOptions> {
  const { token, jobToken, url, apiUrl, proxy, ...rest } =
    await GitLabOptions.parseAsync(options);

  return {
    ...rest,
    token: token || GL_TOKEN || GITLAB_TOKEN,
    jobToken: jobToken || CI_JOB_TOKEN,
    url: url || CI_SERVER_URL || getGitHostUrl(repositoryUrl),
    apiUrl: apiUrl || CI_API_V4_URL,
    proxy: isNil(proxy) ? http_proxy || HTTP_PROXY || false : proxy,
  };
}
