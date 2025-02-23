import { Gitlab, IssueSchema, MergeRequestSchema } from "@gitbeaker/core";
import { GitbeakerRequestError } from "@gitbeaker/requester-utils";
import { template } from "lodash-es";

import {
  Artifact,
  PartialRequired,
  SuccessContext,
} from "@lets-release/config";
import { getSuccessComment } from "@lets-release/git-host";

import { ResolvedGitLabOptions } from "src/schemas/GitLabOptions";

export async function addComment(
  context: SuccessContext,
  gitlab: Gitlab,
  {
    commentOnSuccess,
    successComment,
    successLabels,
  }: Pick<
    ResolvedGitLabOptions,
    "commentOnSuccess" | "successComment" | "successLabels"
  >,
  issue: IssueSchema | MergeRequestSchema,
) {
  const errors: unknown[] = [];
  const { logger, package: pkg, nextRelease, releases } = context;
  const { project_id, iid } = issue;
  const issueOrMR = issue.isMergeRequest ? "MR" : "issue";

  if (
    typeof commentOnSuccess === "function" &&
    !(await commentOnSuccess({ ...context, issue }))
  ) {
    logger.log({
      prefix: `[${pkg.uniqueName}]`,
      message: `Skip commenting to ${issueOrMR} #${iid}.`,
    });

    return errors;
  }

  const body = successComment
    ? template(successComment)({ ...context, issue })
    : getSuccessComment(
        issueOrMR,
        nextRelease,
        releases
          .find(({ tag }) => tag === nextRelease.tag)
          ?.artifacts.filter(({ name }) => !!name) as PartialRequired<
          Artifact,
          "name"
        >[],
      );

  try {
    await (issue.isMergeRequest
      ? gitlab.MergeRequestNotes.create(project_id, iid, body)
      : gitlab.IssueNotes.create(project_id, iid, body));

    logger.log({
      prefix: `[${pkg.uniqueName}]`,
      message: `Added comment to ${issueOrMR} #${iid}`,
    });

    if (successLabels?.length) {
      const labels = successLabels.map((label) => template(label)(context));

      await (issue.isMergeRequest
        ? gitlab.MergeRequests.edit(project_id, iid, {
            add_labels: labels.join(","),
          } as never)
        : gitlab.Issues.edit(project_id, iid, {
            add_labels: labels.join(","),
          } as never));

      logger.log({
        prefix: `[${pkg.uniqueName}]`,
        message: [`Added labels %O to ${issueOrMR} #${iid}`, labels],
      });
    }
  } catch (error) {
    if (
      error instanceof GitbeakerRequestError &&
      error.cause?.response.status === 403
    ) {
      logger.error({
        prefix: `[${pkg.uniqueName}]`,
        message: `Not allowed to add a comment to the ${issueOrMR} #${iid}.`,
      });
    } else if (
      error instanceof GitbeakerRequestError &&
      error.cause?.response.status === 404
    ) {
      logger.error({
        prefix: `[${pkg.uniqueName}]`,
        message: `Failed to add a comment to the ${issueOrMR} #${iid} as it doesn't exist.`,
      });
    } else {
      errors.push(error);

      logger.error({
        prefix: `[${pkg.uniqueName}]`,
        message: `Failed to add a comment to the ${issueOrMR} #${iid}.`,
      });
    }
  }

  return errors;
}
