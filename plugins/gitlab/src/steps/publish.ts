import { GitbeakerRequestError } from "@gitbeaker/requester-utils";
import debug from "debug";
import { isArray, isString } from "lodash-es";
import urlJoin from "url-join";

import { PartialRequired, Step, StepFunction } from "@lets-release/config";
import { findUniqueReleaseAssets } from "@lets-release/git-host";

import { GITLAB_ARTIFACT_NAME } from "src/constants/GITLAB_ARTIFACT_NAME";
import { ensureGitLabContext } from "src/helpers/ensureGitLabContext";
import { uploadReleaseAsset } from "src/helpers/uploadReleaseAsset";
import { name } from "src/plugin";
import {
  GitLabAssetObject,
  ResolvedGitLabAssetObjectWithPath,
  ResolvedGitLabAssetObjectWithUrl,
} from "src/schemas/GitLabAssetObject";
import { GitLabOptions } from "src/schemas/GitLabOptions";

export const publish: StepFunction<Step.publish, GitLabOptions> = async (
  context,
  options,
) => {
  const gitLabContext = await ensureGitLabContext(context, options);

  const {
    gitlab,
    projectId,
    options: { url, assets, mainPackageOnly, milestones },
  } = gitLabContext;

  const {
    logger,
    package: pkg,
    nextRelease: { tag, hash, notes },
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
    await gitlab.ProjectReleases.show(projectId, tag);

    logger.warn({
      prefix: `[${pkg.name}]`,
      message: `Skip publishing as tag ${tag} is already published`,
    });

    return;
  } catch (error) {
    if (
      !(error instanceof GitbeakerRequestError) ||
      error.cause?.response.status !== 404
    ) {
      throw error;
    }
  }

  debug(name)(`release tag: ${tag}`);
  debug(name)(`release tag hash: ${hash}`);
  debug(name)("milestones: %o", milestones);

  // Skip glob if url is provided
  const urlAssets =
    assets?.filter(
      (asset): asset is ResolvedGitLabAssetObjectWithUrl =>
        !isString(asset) && !isArray(asset) && !!asset.url,
    ) ?? [];
  const globAssets = await findUniqueReleaseAssets<
    ResolvedGitLabAssetObjectWithPath,
    PartialRequired<GitLabAssetObject, "path">
  >(
    context,
    assets?.filter(
      (asset): asset is string | string[] | ResolvedGitLabAssetObjectWithPath =>
        isString(asset) || isArray(asset) || !!asset.path,
    ) ?? [],
  );
  const releaseAssets = [...urlAssets, ...globAssets];

  if (releaseAssets.length > 0) {
    debug(name)("release assets: %o", releaseAssets);
  }

  const linkLists = await Promise.all(
    releaseAssets.map(
      async (asset) => await uploadReleaseAsset(context, gitLabContext, asset),
    ),
  );

  debug(name)(`Create a release for git tag ${tag} with commit ${hash}`);

  const release = {
    tag_name: tag,
    description: notes?.trim() ? notes : tag,
    milestones,
    assets: {
      links: linkLists.flat(),
    },
  };

  debug(name)("Release payload: %O", release);

  try {
    await gitlab.ProjectReleases.create(projectId, release);
  } catch (error) {
    logger.error({
      prefix: `[${pkg.name}]`,
      message: [
        "An error occurred while making a request to the GitLab release API:\n%O",
        error,
      ],
    });

    throw error;
  }

  logger.log({
    prefix: `[${pkg.name}]`,
    message: `Published GitLab release: ${tag}`,
  });

  const releaseUrl = urlJoin(
    url,
    projectId,
    `/-/releases/${encodeURIComponent(tag)}`,
  );

  return { name: GITLAB_ARTIFACT_NAME, url: releaseUrl };
};
