import { GitbeakerRequestError } from "@gitbeaker/requester-utils";
import debug from "debug";
import urlJoin from "url-join";

import { Step, StepFunction } from "@lets-release/config";

import { GITLAB_ARTIFACT_NAME } from "src/constants/GITLAB_ARTIFACT_NAME";
import { ensureGitLabContext } from "src/helpers/ensureGitLabContext";
import { name } from "src/plugin";
import { GitLabOptions } from "src/schemas/GitLabOptions";

export const addChannels: StepFunction<
  Step.addChannels,
  GitLabOptions
> = async (context, options) => {
  const {
    gitlab,
    projectId,
    options: { url, mainPackageOnly, milestones },
  } = await ensureGitLabContext(context, options);

  const {
    logger,
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
    tag_name: tag,
    milestones,
  };

  debug(name)("release object: %O", release);

  try {
    await gitlab.ProjectReleases.edit(
      projectId,
      tag,
      notes?.trim() ? { ...release, description: notes } : release,
    );

    logger.log({
      prefix: `[${pkg.name}]`,
      message: `Updated GitLab release: ${tag}`,
    });
  } catch (error) {
    if (
      error instanceof GitbeakerRequestError &&
      error.cause?.response.status === 404
    ) {
      logger.log({
        prefix: `[${pkg.name}]`,
        message: `There is no release for tag ${tag}, creating a new one`,
      });

      await gitlab.ProjectReleases.create(projectId, {
        ...release,
        description: notes?.trim() ? notes : tag,
      });

      logger.log({
        prefix: `[${pkg.name}]`,
        message: `Published GitLab release: ${tag}`,
      });
    } else {
      throw error;
    }
  }

  const releaseUrl = urlJoin(
    url,
    projectId,
    `/-/releases/${encodeURIComponent(tag)}`,
  );

  return { name: GITLAB_ARTIFACT_NAME, url: releaseUrl };
};
