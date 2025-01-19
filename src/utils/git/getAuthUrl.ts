import { debug } from "debug";
import { Options } from "execa";
import { isNil } from "lodash-es";

import { normalizeGitUrl } from "@lets-release/config";

import { name } from "src/program";
import { formatAuthUrl } from "src/utils/git/formatAuthUrl";
import { verifyAuth } from "src/utils/git/verifyAuth";
import { verifyAuthUrl } from "src/utils/git/verifyAuthUrl";

const namespace = `${name}:utils.git.getAuthUrl`;

/**
 * Determine the git repository URL to use to push, either:
 * - The `repositoryUrl` as is if allowed to push
 * - The `repositoryUrl` converted to `https` or `http` with Basic Authentication
 *
 * In addition, expand shortcut URLs (`owner/repo` => `https://github.com/owner/repo.git`) and transform `git+https` / `git+http` URLs to `https` / `http`.
 *
 * @return The formatted Git repository URL.
 */
export async function getAuthUrl(
  repositoryUrl: string,
  branch: string,
  options: Partial<Options> = {},
) {
  const gitTokens = {
    GIT_CREDENTIALS: undefined,
    GH_TOKEN: undefined,
    // GitHub Actions require the "x-access-token:" prefix for git access
    // https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#http-based-git-access-by-an-installation
    GITHUB_TOKEN: isNil(options.env?.GITHUB_ACTION)
      ? undefined
      : "x-access-token:",
    GL_TOKEN: "gitlab-ci-token:",
    GITLAB_TOKEN: "gitlab-ci-token:",
    BB_TOKEN: "x-token-auth:",
    BITBUCKET_TOKEN: "x-token-auth:",
    BB_TOKEN_BASIC_AUTH: "",
    BITBUCKET_TOKEN_BASIC_AUTH: "",
  };

  const normalizedUrl = normalizeGitUrl(repositoryUrl);

  // Test if push is allowed without transforming the URL (e.g. is ssh keys are set up)
  try {
    debug(namespace)(
      `Verifying ssh auth by attempting to push to ${normalizedUrl}`,
    );

    await verifyAuth(normalizedUrl, branch, options);
  } catch {
    debug(namespace)("SSH key auth failed, falling back to https.");

    const envVars = Object.keys(gitTokens).filter(
      (envVar) => !isNil(options.env?.[envVar]),
    ) as (keyof typeof gitTokens)[];

    // Skip verification if there is no ambiguity on which env var to use for authentication
    if (envVars.length === 1) {
      return formatAuthUrl(
        normalizedUrl,
        `${gitTokens[envVars[0]] ?? ""}${options.env?.[envVars[0]]}`,
      );
    }

    if (envVars.length > 1) {
      debug(namespace)(
        `Found ${envVars.length} credentials in environment, trying all of them`,
      );

      const validRepositoryUrls = await Promise.all(
        envVars.map(
          async (envVar) =>
            await verifyAuthUrl(
              formatAuthUrl(
                normalizedUrl,
                `${gitTokens[envVar] ?? ""}${options.env?.[envVar]}`,
              ),
              branch,
              options,
            ),
        ),
      );
      const chosenAuthUrlIndex = validRepositoryUrls.findIndex((url) => !!url);

      if (chosenAuthUrlIndex !== -1) {
        debug(namespace)(
          `Using ${envVars[chosenAuthUrlIndex]} to authenticate`,
        );

        return validRepositoryUrls[chosenAuthUrlIndex]!;
      }
    }
  }

  return normalizedUrl;
}
