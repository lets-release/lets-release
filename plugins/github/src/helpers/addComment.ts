import { RequestError } from "@octokit/request-error";
import debug from "debug";
import { template } from "lodash-es";

import {
  Artifact,
  PartialRequired,
  SuccessContext,
} from "@lets-release/config";
import { getSuccessComment } from "@lets-release/git-host";

import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { name } from "src/plugin";
import { ResolvedGitHubOptions } from "src/schemas/GitHubOptions";
import { Issue } from "src/types/Issue";

export async function addComment(
  context: SuccessContext,
  octokit: LetsReleaseOctokit,
  {
    commentOnSuccess,
    successComment,
    successLabels,
  }: Pick<
    ResolvedGitHubOptions,
    "commentOnSuccess" | "successComment" | "successLabels"
  >,
  owner: string,
  repo: string,
  issue: Issue,
) {
  const errors: unknown[] = [];
  const { logger, package: pkg, nextRelease, releases } = context;
  const { number } = issue;
  const issueOrPR = issue.__typename === "PullRequest" ? "PR" : "issue";

  if (
    typeof commentOnSuccess === "function" &&
    !(await commentOnSuccess({ ...context, issue }))
  ) {
    logger.log({
      prefix: `[${pkg.name}]`,
      message: `Skip commenting to ${issueOrPR} #${number}.`,
    });

    return errors;
  }

  const body = successComment
    ? template(successComment)({ ...context, issue })
    : getSuccessComment(
        issueOrPR,
        nextRelease,
        releases
          .find(({ tag }) => tag === nextRelease.tag)
          ?.artifacts.filter(({ name }) => !!name) as PartialRequired<
          Artifact,
          "name"
        >[],
      );

  try {
    const comment = { owner, repo, issue_number: number, body };

    debug(name)("create comment: %O", comment);

    const {
      data: { html_url: url },
    } = await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      comment,
    );

    logger.log({
      prefix: `[${pkg.name}]`,
      message: `Added comment to ${issueOrPR} #${number}: ${url}`,
    });

    if (successLabels?.length) {
      const labels = successLabels.map((label) => template(label)(context));

      await octokit.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
        {
          owner,
          repo,
          issue_number: number,
          data: labels,
        },
      );

      logger.log({
        prefix: `[${pkg.name}]`,
        message: [`Added labels %O to ${issueOrPR} #${number}`, labels],
      });
    }
  } catch (error) {
    if (error instanceof RequestError && error.status === 403) {
      logger.error({
        prefix: `[${pkg.name}]`,
        message: `Not allowed to add a comment to the ${issueOrPR} #${number}.`,
      });
    } else if (error instanceof RequestError && error.status === 404) {
      logger.error({
        prefix: `[${pkg.name}]`,
        message: `Failed to add a comment to the ${issueOrPR} #${number} as it doesn't exist.`,
      });
    } else {
      errors.push(error);

      logger.error({
        prefix: `[${pkg.name}]`,
        message: `Failed to add a comment to the ${issueOrPR} #${number}.`,
      });
    }
  }

  return errors;
}
