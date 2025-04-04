/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import debug from "debug";
import { isString, template } from "lodash-es";
import mime from "mime";

import { PublishContext } from "@lets-release/config";
import { ReleaseAsset, ReleaseAssetObject } from "@lets-release/git-host";

import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { name } from "src/plugin";

export async function uploadReleaseAsset(
  context: PublishContext,
  octokit: LetsReleaseOctokit,
  url: string,
  asset: ReleaseAsset<ReleaseAssetObject>,
) {
  const { logger, repositoryRoot, package: pkg } = context;
  const filePath = isString(asset) ? asset : asset.path;

  try {
    const file = path.resolve(repositoryRoot, filePath);
    const stats = await stat(file);

    if (!stats.isFile()) {
      logger.error({
        prefix: `[${pkg.uniqueName}]`,
        message: `The asset ${filePath} is not a file, and will be ignored.`,
      });

      return;
    }

    const fileName = template(
      (isString(asset) ? undefined : asset.name) || path.basename(filePath),
    )(context);

    const upload = {
      method: "POST",
      url,
      data: await readFile(file),
      name: fileName,
      headers: {
        "Content-Type": mime.getType(path.extname(fileName)) || "text/plain",
        "Content-Length": stats.size,
      },
    };

    const namespace = `${name}:${pkg.uniqueName}`;
    debug(namespace)(`file path: ${filePath}`);
    debug(namespace)(`file name: ${fileName}`);

    const {
      data: { browser_download_url: downloadUrl },
    } = (await octokit.request({
      ...upload,
      ...(!isString(asset) && asset.label
        ? {
            label: template(asset.label)(context),
          }
        : {}),
    })) as { data: { browser_download_url: string } };

    logger.log({
      prefix: `[${pkg.uniqueName}]`,
      message: `Published file ${downloadUrl}`,
    });
  } catch {
    logger.error({
      prefix: `[${pkg.uniqueName}]`,
      message: `The asset ${filePath} cannot be read, and will be ignored.`,
    });
  }
}
