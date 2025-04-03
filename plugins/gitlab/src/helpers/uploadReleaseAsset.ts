/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { ReleaseAssetLink } from "@gitbeaker/core";
import debug from "debug";
import { isString, template } from "lodash-es";
import urlJoin from "url-join";

import { PublishContext } from "@lets-release/config";
import { ReleaseAsset } from "@lets-release/git-host";

import { AssetTarget } from "src/enums/AssetTarget";
import { AssetType } from "src/enums/AssetType";
import { name } from "src/plugin";
import {
  GitLabAssetObject,
  ResolvedGitLabAssetObjectWithPath,
  ResolvedGitLabAssetObjectWithUrl,
} from "src/schemas/GitLabAssetObject";
import { GitLabContext } from "src/types/GitLabContext";

export async function uploadReleaseAsset(
  context: PublishContext,
  { gitlab, projectId, options: { url: host, apiUrl } }: GitLabContext,
  asset:
    | ReleaseAsset<ResolvedGitLabAssetObjectWithPath>
    | ResolvedGitLabAssetObjectWithUrl,
): Promise<
  (Omit<ReleaseAssetLink, "id" | "external"> &
    Pick<GitLabAssetObject, "filepath">)[]
> {
  const {
    logger,
    repositoryRoot,
    package: pkg,
    nextRelease: { version },
  } = context;
  const namespace = `${name}:${pkg.uniqueName}`;

  if (isString(asset) || asset.path) {
    const filePath = isString(asset) ? asset : asset.path!;

    try {
      const file = path.resolve(repositoryRoot, filePath);
      const stats = await stat(file);

      if (!stats.isFile()) {
        logger.error({
          prefix: `[${pkg.uniqueName}]`,
          message: `The asset ${filePath} is not a file, and will be ignored.`,
        });

        return [];
      }

      const label =
        !isString(asset) && asset.label
          ? template(asset.label)(context)
          : undefined;
      const filename = label || path.basename(file);

      debug(namespace)(`file path: ${filePath}`);
      debug(namespace)(`file label: ${label}`);
      debug(namespace)(`Uploading the file ${file}`);

      if (!isString(asset) && asset.target === AssetTarget.GenericPackage) {
        // Upload generic packages
        try {
          const {
            file: { url },
          } = await gitlab.PackageRegistry.publish(
            projectId,
            "release",
            version,
            {
              filename,
              content: new Blob([await readFile(file)]),
            },
            {
              select: "package_file",
              status: asset.status,
            },
          );

          const encodedVersion = encodeURIComponent(version);
          const encodedFilename = encodeURIComponent(filename);
          // https://docs.gitlab.com/ee/user/packages/generic_packages/#download-package-file
          const downloadUrl = urlJoin(
            apiUrl ?? urlJoin(host, "/api/v4"),
            `/projects/${projectId}/packages/generic/release/${encodedVersion}/${encodedFilename}`,
          );

          logger.log({
            prefix: `[${pkg.uniqueName}]`,
            message: `Uploaded file: ${downloadUrl} (${url})`,
          });

          return [
            {
              name: label || "release",
              url: downloadUrl,
              link_type: AssetType.Package,
              filepath: asset.filepath,
            },
          ];
        } catch (error) {
          logger.error({
            prefix: `[${pkg.uniqueName}]`,
            message: [
              `An error occurred while uploading ${file} to the GitLab generics package API:\n%O`,
              error,
            ],
          });

          throw error;
        }
      } else {
        // Handle normal assets
        try {
          const { alt, full_path } = await gitlab.Projects.uploadForReference(
            projectId,
            {
              filename,
              content: new Blob([await readFile(file)]),
            },
          );

          const url = urlJoin(host, full_path);

          logger.log({
            prefix: `[${pkg.uniqueName}]`,
            message: `Uploaded file: ${url}`,
          });

          return [
            {
              name: label || alt,
              url,
              link_type: isString(asset) ? AssetType.Other : asset.type,
              filepath: isString(asset) ? undefined : asset.filepath,
            },
          ];
        } catch (error) {
          logger.error({
            prefix: `[${pkg.uniqueName}]`,
            message: [
              `An error occurred while uploading ${file} to the GitLab project uploads API:\n%O`,
              error,
            ],
          });

          throw error;
        }
      }
    } catch {
      logger.error({
        prefix: `[${pkg.uniqueName}]`,
        message: `The asset ${filePath} cannot be read, and will be ignored.`,
      });

      return [];
    }
  } else {
    const { url, label, type, filepath } = asset;

    debug(namespace)(`use link from release setting: ${url}`);

    return [
      {
        name: label || url!,
        url: url!,
        link_type: type,
        filepath,
      },
    ];
  }
}
