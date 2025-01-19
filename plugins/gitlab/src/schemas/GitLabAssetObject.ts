import { z } from "zod";

import { NonEmptyString, PartialRequired } from "@lets-release/config";
import { AssetObject } from "@lets-release/git-host";

import { AssetTarget } from "src/enums/AssetTarget";
import { AssetType } from "src/enums/AssetType";
import { GenericPackageStatus } from "src/enums/GenericPackageStatus";

export const GitLabAssetObject = AssetObject.partial()
  .extend({
    /**
     * Alternative to setting `path` this provides the ability to add links to releases, e.g. URLs to container images. Supports [Lodash templating][].
     *
     * [Lodash templating]: https://lodash.com/docs#template
     */
    url: NonEmptyString.optional(),

    /**
     * Asset type displayed on the GitLab release. Can be `runbook`, `package`, `image` and `other` (see official documents on [release assets][]). Supports [Lodash templating][].
     *
     * @default AssetType.Other
     *
     * [release assets]: https://docs.gitlab.com/ee/user/project/releases/#release-assets
     * [Lodash templating]: https://lodash.com/docs#template
     */
    type: z
      .enum(Object.values(AssetType) as [AssetType, ...AssetType[]])
      .default(AssetType.Other),

    /**
     * A filepath for creating a permalink pointing to the asset (requires GitLab 12.9+, see official documents on [permanent links][]). Ignored if `path` matches more than one file. Supports [Lodash templating][].
     *
     * [permanent links]: https://docs.gitlab.com/ee/user/project/releases/#permanent-links-to-release-assets
     * [Lodash templating]: https://lodash.com/docs#template
     */
    filepath: NonEmptyString.optional(),

    /**
     * Controls where the file is uploaded to. Can be set to `project_upload` for storing the file as [project upload][] or `generic_package` for storing the file as [generic package][].
     *
     * @default AssetTarget.ProjectUpload
     *
     * [project upload]: https://docs.gitlab.com/ee/api/projects.html#upload-a-file
     * [generic package]: https://docs.gitlab.com/ee/user/packages/generic_packages/
     */
    target: z
      .enum(Object.values(AssetTarget) as [AssetTarget, ...AssetTarget[]])
      .default(AssetTarget.ProjectUpload),

    /**
     * This is only applied, if `target` is set to `generic_package`. The generic package status. Can be `default` and `hidden` (see official documents on [generic packages][generic package]).
     *
     * @default GenericPackageStatus.Default
     *
     * [generic package]: https://docs.gitlab.com/ee/user/packages/generic_packages/
     */
    status: z
      .nativeEnum(GenericPackageStatus)
      .default(GenericPackageStatus.Default),
  })
  .superRefine((val, ctx) => {
    if (!val.path && !val.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either `path` or `url` must be set.",
      });
    }
  });

export type GitLabAssetObject = z.input<typeof GitLabAssetObject>;

export type ResolvedGitLabAssetObject = Omit<
  z.output<typeof GitLabAssetObject>,
  "path"
> & { path?: string };

export type ResolvedGitLabAssetObjectWithUrl = PartialRequired<
  Exclude<ResolvedGitLabAssetObject, string | string[]>,
  "url"
>;

export type ResolvedGitLabAssetObjectWithPath = PartialRequired<
  Exclude<ResolvedGitLabAssetObject, string | string[]>,
  "path"
>;
