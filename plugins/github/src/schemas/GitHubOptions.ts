import { z } from "zod";

import { NonEmptyString, PartialRequired } from "@lets-release/config";
import { GitHostOptions } from "@lets-release/git-host";

export const GitHubOptions = GitHostOptions.extend({
  /**
   * The GitHub Token.
   *
   * Default: `GH_TOKEN` or `GITHUB_TOKEN` environment variable.
   */
  token: NonEmptyString.optional(),

  /**
   * The GitHub server endpoint.
   *
   * Default: `GITHUB_SERVER_URL` or get from `repositoryUrl` options.
   */
  url: NonEmptyString.optional(),

  /**
   * The GitHub API endpoint.
   *
   * Default: `GITHUB_API_URL` environment variable.
   */
  apiUrl: NonEmptyString.optional(),

  /**
   * Set the release as latest for the main package only.
   *
   * @default true
   */
  makeLatestMainPackageOnly: z.boolean().default(true),

  /**
   * A boolean indicating if a GitHub Draft Release should be created instead of publishing an actual GitHub Release.
   */
  draftRelease: z.boolean().default(false),

  /**
   * The category name in which to create a linked discussion to the release.
   *
   * Default: not creating a linked discussion.
   */
  discussionCategoryName: NonEmptyString.optional(),
});

export type GitHubOptions = z.input<typeof GitHubOptions>;

export type ResolvedGitHubOptions = PartialRequired<
  z.output<typeof GitHubOptions>,
  "url" | "proxy"
>;
