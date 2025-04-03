/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { escapeRegExp } from "lodash-es";

import {
  BaseContext,
  parseGitUrl,
  parseGitUrlPath,
} from "@lets-release/config";

import { InvalidGitLabUrlError } from "src/errors/InvalidGitLabUrlError";
import { ResolvedGitLabOptions } from "src/schemas/GitLabOptions";

export function parseGitLabUrl(
  {
    env: { CI_PROJECT_PATH },
    options: { repositoryUrl },
  }: Pick<BaseContext, "env" | "options">,
  { url }: Pick<ResolvedGitLabOptions, "url">,
) {
  const slug =
    CI_PROJECT_PATH ||
    parseGitUrl(repositoryUrl).pathname.replace(
      new RegExp(`^${escapeRegExp(parseGitUrl(url).pathname)}`),
      "",
    );

  const { owner, repo } = parseGitUrlPath(`/${slug}`);

  if (!owner || !repo) {
    throw new InvalidGitLabUrlError();
  }

  return {
    owner,
    repo,
  };
}
