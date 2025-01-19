import { RequestError } from "@octokit/request-error";
import { debug } from "debug";

import { FindPackagesContext } from "@lets-release/config";
import { generateFetchFunction } from "@lets-release/git-host";

import { InvalidGitHubTokenError } from "src/errors/InvalidGitHubTokenError";
import { MismatchGitHubUrlError } from "src/errors/MismatchGitHubUrlError";
import { NoGitHubPermissionError } from "src/errors/NoGitHubPermissionError";
import { NoGitHubTokenError } from "src/errors/NoGitHubTokenError";
import { RepoNotFoundError } from "src/errors/RepoNotFoundError";
import { parseGitHubUrl } from "src/helpers/parseGitHubUrl";
import { resolveGitHubOptions } from "src/helpers/resolveGitHubOptions";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { name } from "src/plugin";
import { GitHubOptions } from "src/schemas/GitHubOptions";
import { GitHubContext } from "src/types/GitHubContext";

export async function ensureGitHubContext(
  { getPluginContext, setPluginContext, ...rest }: FindPackagesContext,
  options: GitHubOptions,
) {
  const gitHubContext = getPluginContext<GitHubContext>();

  if (gitHubContext) {
    return gitHubContext;
  }

  const {
    env,
    options: { repositoryUrl },
  } = rest;
  const { repo, owner } = parseGitHubUrl(repositoryUrl);
  const resolvedOptions = await resolveGitHubOptions(rest, options);
  const { token, apiUrl, proxy } = resolvedOptions;
  const octokit = new LetsReleaseOctokit({
    ...(apiUrl ? { baseUrl: apiUrl } : {}),
    auth: token,
    request: {
      fetch: generateFetchFunction(proxy),
    },
  });

  if (apiUrl) {
    debug(name)(`Verify GitHub authentication (${apiUrl})`);
  } else {
    debug(name)("Verify GitHub authentication");
  }

  const errors = [];

  if (token) {
    try {
      const {
        data: { permissions, clone_url },
      } = await octokit.request("GET /repos/{owner}/{repo}", { repo, owner });

      // Verify if Repository Name wasn't changed
      const parsedCloneUrl = parseGitHubUrl(clone_url);

      if (
        `${owner}/${repo}`.toLowerCase() !==
        `${parsedCloneUrl.owner}/${parsedCloneUrl.repo}`.toLowerCase()
      ) {
        errors.push(new MismatchGitHubUrlError(repositoryUrl, clone_url));
      }

      // https://github.com/semantic-release/github/issues/182
      // Do not check for permissions in GitHub actions, as the provided token is an installation access token.
      // octokit.request("GET /repos/{owner}/{repo}", {repo, owner}) does not return the "permissions" key in that case.
      // But GitHub Actions have all permissions required for @lets-release/github to work
      if (
        !env.GITHUB_ACTION &&
        // If authenticated as GitHub App installation, `push` will always be false.
        !permissions?.push &&
        // We send another request to check if current authentication is an installation.
        // Note: we cannot check if the installation has all required permissions, it's
        // up to the user to make sure it has
        !(await octokit
          .request("HEAD /installation/repositories", { per_page: 1 })
          .catch(() => false))
      ) {
        errors.push(new NoGitHubPermissionError(owner, repo));
      }
    } catch (error) {
      if (error instanceof RequestError && error.status === 401) {
        errors.push(new InvalidGitHubTokenError(owner, repo));
      } else if (error instanceof RequestError && error.status === 404) {
        errors.push(new RepoNotFoundError(owner, repo));
      } else {
        errors.push(error);
      }
    }
  } else {
    errors.push(new NoGitHubTokenError(owner, repo));
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, "AggregateError");
  }

  const newGitHubContext: GitHubContext = {
    octokit,
    owner,
    repo,
    options: resolvedOptions,
  };

  setPluginContext<GitHubContext>(newGitHubContext);

  return newGitHubContext;
}
