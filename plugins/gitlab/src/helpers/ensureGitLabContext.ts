import { GitbeakerRequestError } from "@gitbeaker/requester-utils";
import { Gitlab } from "@gitbeaker/rest";
import debug from "debug";

import { Step, StepContext } from "@lets-release/config";
import { generateFetchFunction } from "@lets-release/git-host";

import { InvalidGitLabTokenError } from "src/errors/InvalidGitLabTokenError";
import { NoGitLabPullPermissionError } from "src/errors/NoGitLabPullPermissionError";
import { NoGitLabPushPermissionError } from "src/errors/NoGitLabPushPermissionError";
import { NoGitLabTokenError } from "src/errors/NoGitLabTokenError";
import { RepoNotFoundError } from "src/errors/RepoNotFoundError";
import { parseGitLabUrl } from "src/helpers/parseGitLabUrl";
import { resolveGitLabOptions } from "src/helpers/resolveGitLabOptions";
import { name } from "src/plugin";
import { GitLabOptions } from "src/schemas/GitLabOptions";
import { GitLabContext } from "src/types/GitLabContext";

export async function ensureGitLabContext<T extends Step>(
  { getPluginContext, setPluginContext, ...rest }: StepContext<T>,
  options: GitLabOptions,
) {
  const gitLabContext = getPluginContext<GitLabContext>();

  if (gitLabContext) {
    return gitLabContext;
  }

  const {
    options: { dryRun },
  } = rest as unknown as StepContext<Step.fail>;

  const resolvedOptions = await resolveGitLabOptions(rest, options);
  const { token, oauthToken, jobToken, url, proxy } = resolvedOptions;
  const { owner, repo } = parseGitLabUrl(rest, { url });
  const projectId = `${owner}/${repo}`;
  // https://github.com/jdalrymple/gitbeaker/blob/main/docs/FAQ.md#support-for-node-v1618
  globalThis.fetch = generateFetchFunction(proxy) as typeof fetch;
  const gitlab = new Gitlab({
    host: url,
    token,
    oauthToken,
    jobToken,
  });

  const errors = [];

  if (token || oauthToken || jobToken) {
    debug(name)(`Verify GitLab authentication (${url})`);

    try {
      const {
        permissions: { project_access, group_access },
      } = await gitlab.Projects.show(projectId);

      if (
        dryRun &&
        project_access.access_level < 10 &&
        group_access.access_level < 10
      ) {
        errors.push(new NoGitLabPullPermissionError(owner, repo));
      } else if (
        project_access.access_level < 30 &&
        group_access.access_level < 30
      ) {
        errors.push(new NoGitLabPushPermissionError(owner, repo));
      }
    } catch (error) {
      if (
        error instanceof GitbeakerRequestError &&
        error.cause?.response.status === 401
      ) {
        errors.push(new InvalidGitLabTokenError(owner, repo));
      } else if (
        error instanceof GitbeakerRequestError &&
        error.cause?.response.status === 404
      ) {
        errors.push(new RepoNotFoundError(owner, repo));
      } else {
        errors.push(error);
      }
    }
  } else {
    errors.push(new NoGitLabTokenError(owner, repo));
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, "AggregateError");
  }

  const newGitLabContext: GitLabContext = {
    gitlab,
    owner,
    repo,
    projectId,
    options: resolvedOptions,
  };

  setPluginContext<GitLabContext>(newGitLabContext);

  return newGitLabContext;
}
