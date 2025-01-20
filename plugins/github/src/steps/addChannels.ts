import { RequestError } from "@octokit/request-error";
import debug from "debug";

import { BranchType, Step, StepFunction } from "@lets-release/config";

import { GITHUB_ARTIFACT_NAME } from "src/constants/GITHUB_ARTIFACT_NAME";
import { ensureGitHubContext } from "src/helpers/ensureGitHubContext";
import { name } from "src/plugin";
import { GitHubOptions } from "src/schemas/GitHubOptions";

export const addChannels: StepFunction<
  Step.addChannels,
  GitHubOptions
> = async (context, options) => {
  const {
    octokit,
    owner,
    repo,
    options: { mainPackageOnly },
  } = await ensureGitHubContext(context, options);

  const {
    logger,
    options: { prerelease },
    branch,
    package: pkg,
    nextRelease: { tag, notes },
  } = context;

  if (mainPackageOnly && !pkg.main) {
    logger.warn({
      prefix: `[${pkg.name}]`,
      message: `Skip as it is not the main package`,
    });

    return;
  }

  const release = {
    owner,
    repo,
    name: tag,
    prerelease: branch.type === BranchType.prerelease || !!prerelease,
    tag_name: tag,
  };

  debug(name)("release object: %O", release);

  try {
    const {
      data: { id: releaseId },
    } = await octokit.request("GET /repos/{owner}/{repo}/releases/tags/{tag}", {
      owner,
      repo,
      tag,
    });

    debug(name)(`release release_id: ${releaseId}`);

    const {
      data: { html_url: url },
    } = await octokit.request(
      "PATCH /repos/{owner}/{repo}/releases/{release_id}",
      { ...release, release_id: releaseId },
    );

    logger.log({
      prefix: `[${pkg.name}]`,
      message: `Updated GitHub release: ${url}`,
    });

    return { name: GITHUB_ARTIFACT_NAME, url, id: releaseId };
  } catch (error) {
    if (error instanceof RequestError && error.status === 404) {
      logger.log({
        prefix: `[${pkg.name}]`,
        message: `There is no release for tag ${tag}, creating a new one`,
      });

      const {
        data: { html_url: url, id },
      } = await octokit.request("POST /repos/{owner}/{repo}/releases", {
        ...release,
        body: notes,
      });

      logger.log({
        prefix: `[${pkg.name}]`,
        message: `Published GitHub release: ${url}`,
      });

      return { name: GITHUB_ARTIFACT_NAME, url, id };
    }

    throw error;
  }
};
