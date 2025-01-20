import { RequestError } from "@octokit/request-error";
import debug from "debug";
import { template } from "lodash-es";

import { BranchType, Step, StepFunction } from "@lets-release/config";
import { findUniqueReleaseAssets } from "@lets-release/git-host";

import { GITHUB_ARTIFACT_NAME } from "src/constants/GITHUB_ARTIFACT_NAME";
import { ensureGitHubContext } from "src/helpers/ensureGitHubContext";
import { uploadReleaseAsset } from "src/helpers/uploadReleaseAsset";
import { name } from "src/plugin";
import { GitHubOptions } from "src/schemas/GitHubOptions";
import { GitHubArtifactInfo } from "src/types/GitHubArtifactInfo";

export const publish: StepFunction<Step.publish, GitHubOptions> = async (
  context,
  options,
): Promise<GitHubArtifactInfo | undefined> => {
  const {
    octokit,
    owner,
    repo,
    options: {
      assets,
      mainPackageOnly,
      makeLatestMainPackageOnly,
      draftRelease,
      releaseNameTemplate,
      releaseBodyTemplate,
      discussionCategoryName,
    },
  } = await ensureGitHubContext(context, options);

  const {
    options: { prerelease },
    branch,
    package: pkg,
    nextRelease: { tag },
    logger,
  } = context;

  if (mainPackageOnly && !pkg.main) {
    logger.warn({
      prefix: `[${pkg.name}]`,
      message: `Skip as it is not the main package`,
    });

    return;
  }

  // skip if already published
  try {
    await octokit.request("GET /repos/{owner}/{repo}/releases/tags/{tag}", {
      owner,
      repo,
      tag,
    });

    logger.warn({
      prefix: `[${pkg.name}]`,
      message: `Skip publishing as tag ${tag} is already published`,
    });

    return;
  } catch (error) {
    if (!(error instanceof RequestError) || error.status !== 404) {
      throw error;
    }
  }

  const release = {
    owner,
    repo,
    tag_name: tag,
    target_commitish: branch.name,
    name: template(releaseNameTemplate)(context),
    body: template(releaseBodyTemplate)(context),
    prerelease: branch.type === BranchType.prerelease || !!prerelease,
    make_latest:
      branch.type === BranchType.main &&
      (!makeLatestMainPackageOnly || pkg.main)
        ? ("true" as const)
        : ("false" as const),
  };

  debug(name)("release object: %O", release);

  const draftReleaseOptions = { ...release, draft: true };

  // When there are no assets, we publish a release directly.
  if (!assets || assets.length === 0) {
    // If draftRelease is true we create a draft release instead.
    if (draftRelease) {
      const {
        data: { html_url: url, id: releaseId },
      } = await octokit.request(
        "POST /repos/{owner}/{repo}/releases",
        draftReleaseOptions,
      );

      logger.log({
        prefix: `[${pkg.name}]`,
        message: `Created GitHub draft release: ${url}`,
      });

      return { name: GITHUB_ARTIFACT_NAME, url, id: releaseId };
    }

    const {
      data: { html_url: url, id: releaseId, discussion_url },
    } = await octokit.request("POST /repos/{owner}/{repo}/releases", {
      ...release,
      // add discussion_category_name if discussionCategoryName is not undefined or false
      ...(discussionCategoryName
        ? {
            discussion_category_name: discussionCategoryName,
          }
        : {}),
    });

    logger.log({
      prefix: `[${pkg.name}]`,
      message: `Published GitHub release: ${url}`,
    });

    if (discussionCategoryName) {
      logger.log({
        prefix: `[${pkg.name}]`,
        message: `Created GitHub release discussion: ${discussion_url}`,
      });
    }

    return { name: GITHUB_ARTIFACT_NAME, url, id: releaseId, discussion_url };
  }

  // We'll create a draft release, append the assets to it, and then publish it.
  // This is so that the assets are available when we get a Github release event.
  const {
    data: { upload_url: uploadUrl, html_url: draftUrl, id: releaseId },
  } = await octokit.request(
    "POST /repos/{owner}/{repo}/releases",
    draftReleaseOptions,
  );

  // Append assets to the release
  const releaseAssets = await findUniqueReleaseAssets(context, assets);

  debug(name)("release assets: %o", releaseAssets);

  await Promise.all(
    releaseAssets.map(
      async (asset) =>
        await uploadReleaseAsset(context, octokit, uploadUrl, asset),
    ),
  );

  // If we want to create a draft we don't need to update the release again
  if (draftRelease) {
    logger.log({
      prefix: `[${pkg.name}]`,
      message: `Created GitHub draft release: ${draftUrl}`,
    });

    return { name: GITHUB_ARTIFACT_NAME, url: draftUrl, id: releaseId };
  }

  const patchRelease = {
    owner,
    repo,
    release_id: releaseId,
    draft: false,
  };

  const {
    data: { html_url: url, discussion_url },
  } = await octokit.request(
    "PATCH /repos/{owner}/{repo}/releases/{release_id}",
    {
      ...patchRelease,
      // add discussion_category_name if discussionCategoryName is not undefined or false
      ...(discussionCategoryName
        ? { discussion_category_name: discussionCategoryName }
        : {}),
    },
  );

  logger.log({
    prefix: `[${pkg.name}]`,
    message: `Published GitHub release: ${url}`,
  });

  if (discussionCategoryName) {
    logger.log({
      prefix: `[${pkg.name}]`,
      message: `Created GitHub release discussion: ${discussion_url}`,
    });
  }

  return { name: GITHUB_ARTIFACT_NAME, url, id: releaseId, discussion_url };
};
