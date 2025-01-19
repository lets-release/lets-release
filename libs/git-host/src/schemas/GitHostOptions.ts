import { z } from "zod";

import { NonEmptyString, PartialRequired } from "@lets-release/config";

import { Asset } from "src/schemas/Asset";
import { ProxyOptions } from "src/schemas/ProxyOptions";

export const GitHostOptions = z.object({
  /**
   * The git host server endpoint.
   */
  url: NonEmptyString.optional(),

  /**
   * The git host api endpoint.
   */
  apiUrl: NonEmptyString.optional(),

  /**
   * The proxy to use to access the API. Set to false to disable usage of proxy.
   *
   * Default: `http_proxy` or `HTTP_PROXY` environment variable.
   */
  proxy: ProxyOptions.optional(),

  /**
   * An array of files to upload to the release.
   */
  assets: z.array(Asset).optional(),

  /**
   * Position to add other artifact links to the Release. Can be `"bottom"` or `"top"`.
   *
   * Default: `undefined` to not adding any other release links.
   */
  positionOfOtherArtifacts: z.enum(["bottom", "top"]).optional(),

  /**
   * Create releases for the main package only.
   *
   * @default false
   */
  mainPackageOnly: z.boolean().default(false),

  /**
   * A [Lodash template][] to customize the release's name.
   *
   * [Lodash template]: https://lodash.com/docs#template
   */
  releaseNameTemplate: NonEmptyString.default("${nextRelease.tag}"),

  /**
   * A [Lodash template][] to customize the release's body.
   *
   * [Lodash template]: https://lodash.com/docs#template
   */
  releaseBodyTemplate: NonEmptyString.default("${nextRelease.notes}"),

  /**
   * Whether to comment on issues or pull requests when success.
   */
  commentOnSuccess: z
    .union([
      z.boolean(),
      z.function().returns(z.union([z.boolean(), z.promise(z.boolean())])),
    ])
    .default(true),

  /**
   * The comment to add to each issue and pull request resolved by the release.
   */
  successComment: NonEmptyString.optional(),

  /**
   * The labels to add to each issue and pull request resolved by the release.
   */
  successLabels: z.array(NonEmptyString).optional(),
});

export type GitHostOptions = z.input<typeof GitHostOptions>;

export type ResolvedGitHostOptions = PartialRequired<
  z.output<typeof GitHostOptions>,
  "url" | "proxy"
>;
