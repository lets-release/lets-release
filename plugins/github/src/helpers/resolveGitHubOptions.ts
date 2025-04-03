/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { isNil } from "lodash-es";

import { BaseContext } from "@lets-release/config";
import { getGitHostUrl } from "@lets-release/git-host";

import {
  GitHubOptions,
  ResolvedGitHubOptions,
} from "src/schemas/GitHubOptions";

export async function resolveGitHubOptions(
  {
    env: {
      GH_TOKEN,
      GITHUB_TOKEN,
      GITHUB_SERVER_URL,
      GITHUB_API_URL,
      http_proxy,
      HTTP_PROXY,
    },
    options: { repositoryUrl },
  }: Pick<BaseContext, "env" | "options">,
  options: GitHubOptions,
): Promise<ResolvedGitHubOptions> {
  const { token, url, apiUrl, proxy, ...rest } =
    await GitHubOptions.parseAsync(options);

  return {
    ...rest,
    token: token || GH_TOKEN || GITHUB_TOKEN,
    url: url || GITHUB_SERVER_URL || getGitHostUrl(repositoryUrl),
    apiUrl: apiUrl || GITHUB_API_URL,
    proxy: isNil(proxy) ? http_proxy || HTTP_PROXY || false : proxy,
  };
}
