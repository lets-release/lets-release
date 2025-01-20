import debug from "debug";
import { isNil, uniqBy } from "lodash-es";
import pFilter from "p-filter";

import {
  Artifact,
  PartialRequired,
  Step,
  StepFunction,
  handleByChunks,
} from "@lets-release/config";
import { getArtifactMarkdown, parseIssues } from "@lets-release/git-host";

import { GITHUB_ARTIFACT_NAME } from "src/constants/GITHUB_ARTIFACT_NAME";
import { addComment } from "src/helpers/addComment";
import { ensureGitHubContext } from "src/helpers/ensureGitHubContext";
import { filterPullRequest } from "src/helpers/filterPullRequest";
import { generateGetBatchIssuesOrPullRequestsQuery } from "src/helpers/generateGetBatchIssuesOrPullRequestsQuery";
import { getAssociatedPullRequests } from "src/helpers/getAssociatedPullRequests";
import { getRepoInfo } from "src/helpers/getRepoInfo";
import { name } from "src/plugin";
import { GitHubOptions } from "src/schemas/GitHubOptions";
import { GitHubArtifact } from "src/types/GitHubArtifact";
import { Issue } from "src/types/Issue";
import { PullRequest } from "src/types/PullRequest";

export const success: StepFunction<Step.success, GitHubOptions> = async (
  context,
  options,
) => {
  const {
    octokit,
    options: {
      url,
      commentOnSuccess,
      successComment,
      successLabels,
      positionOfOtherArtifacts,
    },
  } = await ensureGitHubContext(context, options);

  const {
    options: { repositoryUrl },
    commits,
    nextRelease,
    releases,
  } = context;

  // In case the repo changed name, get the new `repo`/`owner` as the search API will not follow redirects
  const { owner, repo } = await getRepoInfo(octokit, repositoryUrl);

  const errors: unknown[] = [];

  if (commits.length === 0) {
    debug(name)("No commits found in release");
  } else if (commentOnSuccess !== false) {
    const shas = commits.map(({ hash }) => hash);

    // Get associatedPRs
    const associatedPRs = await handleByChunks(
      shas,
      100,
      async (chunk) =>
        await getAssociatedPullRequests(octokit, owner, repo, chunk),
    );

    const prs = await pFilter(
      uniqBy(associatedPRs.flat(), "number"),
      async (pullRequest) =>
        // ? is it necessary?
        await filterPullRequest(octokit, owner, repo, shas, pullRequest),
    );

    debug(name)(
      "found pull requests: %O",
      prs.map((pr) => pr.number),
    );

    // Get relatedIssues (or relatedPRs i.e. Issues/PRs that are closed by an associatedPR)
    const issues = await handleByChunks(
      // Parse the release commits message and PRs body to find resolved issues/PRs via comment keywords
      parseIssues(
        "github",
        owner,
        repo,
        [
          ...prs.map((pr) => pr.body),
          ...commits.map((commit) => commit.message),
        ],
        url === "https://github.com" ? undefined : url,
      ),
      100,
      async (chunk) => {
        const { repository } = await octokit.graphql<{
          repository: Record<string, Issue | PullRequest>;
        }>(
          generateGetBatchIssuesOrPullRequestsQuery(
            chunk.map((number) => number),
          ),
          { owner, repo },
        );

        return Object.values(repository);
      },
    );

    if (issues.length > 0) {
      debug(name)(
        "found related issues via PRs and Commits: %O",
        issues.map(({ number }) => number),
      );
    }

    const commentErrors = await Promise.all(
      uniqBy([...prs, ...issues], "number").map(
        async (issue) =>
          await addComment(
            context,
            octokit,
            { commentOnSuccess, successComment, successLabels },
            owner,
            repo,
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
    const githubArtifact = artifacts?.find(
      ({ name }) => !!name && name === GITHUB_ARTIFACT_NAME,
    ) as GitHubArtifact;
    const additionalArtifacts = artifacts?.filter(
      ({ name }) => !!name && name !== GITHUB_ARTIFACT_NAME,
    ) as PartialRequired<Artifact, "name">[];

    if (
      !isNil(githubArtifact) &&
      !isNil(githubArtifact.id) &&
      additionalArtifacts?.length
    ) {
      const markdown = `This release is also available on:\n${additionalArtifacts
        .map((artifact) => `- ${getArtifactMarkdown(artifact)}`)
        .join("\n")}`;
      const newBody =
        positionOfOtherArtifacts === "top"
          ? `${markdown}\n---\n${nextRelease.notes ?? ""}`
          : `${nextRelease.notes ?? ""}\n---\n${markdown}`;

      await octokit.request(
        "PATCH /repos/{owner}/{repo}/releases/{release_id}",
        {
          owner,
          repo,
          release_id: githubArtifact.id,
          body: newBody,
        },
      );
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, "AggregateError");
  }
};
