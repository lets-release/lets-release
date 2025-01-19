import { debug } from "debug";
import { isNil, uniqBy } from "lodash-es";

import {
  Artifact,
  PartialRequired,
  Step,
  StepFunction,
  handleByChunks,
} from "@lets-release/config";
import { getArtifactMarkdown, parseIssues } from "@lets-release/git-host";

import { GITLAB_ARTIFACT_NAME } from "src/constants/GITLAB_ARTIFACT_NAME";
import { addComment } from "src/helpers/addComment";
import { ensureGitLabContext } from "src/helpers/ensureGitLabContext";
import { findIssues } from "src/helpers/findIssues";
import { getAssociatedMergeRequests } from "src/helpers/getAssociatedMergeRequests";
import { name } from "src/plugin";
import { GitLabOptions } from "src/schemas/GitLabOptions";

export const success: StepFunction<Step.success, GitLabOptions> = async (
  context,
  options,
) => {
  const {
    gitlab,
    owner,
    repo,
    projectId,
    options: {
      url,
      commentOnSuccess,
      successComment,
      successLabels,
      positionOfOtherArtifacts,
    },
  } = await ensureGitLabContext(context, options);

  const { commits, nextRelease, releases } = context;

  const errors: unknown[] = [];

  if (commits.length === 0) {
    debug(name)("No commits found in release");
  } else if (commentOnSuccess !== false) {
    const associatedMRs = await Promise.all(
      commits.map(
        async ({ hash }) =>
          await getAssociatedMergeRequests(gitlab, projectId, hash),
      ),
    );
    const mrs = uniqBy(associatedMRs.flat(), "iid");

    debug(name)(
      "found merge requests: %O",
      mrs.map((mr) => mr.iid),
    );

    const mrIssues = await Promise.all(
      mrs.map(async ({ project_id, iid }) => {
        const relatedIssues = await gitlab.MergeRequests.allIssuesClosed(
          project_id,
          iid,
        );

        return relatedIssues.filter((x) => x.state === "closed");
      }),
    );

    const commitIssues = await handleByChunks(
      parseIssues(
        "gitlab",
        owner,
        repo,
        commits.map((commit) => commit.message),
        url === "https://gitlab.com" ? undefined : url,
      ),
      100,
      async (iids) => await findIssues(gitlab, projectId, { iids }),
    );
    const issues = uniqBy([...mrIssues.flat(), ...commitIssues], "iid");

    if (issues.length > 0) {
      debug(name)(
        "found related issues via PRs and Commits: %O",
        issues.map(({ iid }) => iid),
      );
    }

    const commentErrors = await Promise.all(
      [...mrs, ...issues].map(
        async (issue) =>
          await addComment(
            context,
            gitlab,
            { commentOnSuccess, successComment, successLabels },
            issue,
          ),
      ),
    );

    errors.push(...commentErrors.flat());
  }

  if (positionOfOtherArtifacts && errors.length === 0) {
    const artifacts = releases.find(
      ({ tag }) => tag === nextRelease.tag,
    )?.artifacts;
    const gitlabArtifact = artifacts?.find(
      ({ name }) => !!name && name === GITLAB_ARTIFACT_NAME,
    );
    const additionalArtifacts = artifacts?.filter(
      ({ name }) => !!name && name !== GITLAB_ARTIFACT_NAME,
    ) as PartialRequired<Artifact, "name">[];

    if (!isNil(gitlabArtifact) && additionalArtifacts?.length) {
      const markdown = `This release is also available on:\n${additionalArtifacts
        .map((artifact) => `- ${getArtifactMarkdown(artifact)}`)
        .join("\n")}`;
      const newBody =
        positionOfOtherArtifacts === "top"
          ? `${markdown}\n---\n${nextRelease.notes ?? ""}`
          : `${nextRelease.notes ?? ""}\n---\n${markdown}`;

      await gitlab.ProjectReleases.edit(projectId, nextRelease.tag, {
        description: newBody,
      });
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, "AggregateError");
  }
};
