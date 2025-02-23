import path from "node:path";

import { isArray, isString, uniqWith } from "lodash-es";

import { PublishContext } from "@lets-release/config";

import { findReleaseAssets } from "src/helpers/findReleaseAssets";
import { Asset } from "src/schemas/Asset";
import { AssetObject } from "src/schemas/AssetObject";
import { ReleaseAsset } from "src/types/ReleaseAsset";
import { ReleaseAssetObject } from "src/types/ReleaseAssetObject";

export async function findUniqueReleaseAssets<
  T extends ReleaseAssetObject,
  U extends AssetObject,
>(
  context: Pick<PublishContext, "repositoryRoot" | "package">,
  assets: Asset<U>[],
): Promise<ReleaseAsset<T>[]> {
  const list = await Promise.all(
    assets.map(async (asset) => await findReleaseAssets<T, U>(context, asset)),
  );

  const { repositoryRoot } = context;

  return uniqWith(
    list
      .flat()
      // Sort with Object first, to prioritize Object definition over Strings in deduplication
      .sort((asset) => (!isArray(asset) && !isString(asset) ? -1 : 1)),
    // Compare `path` property if Object definition, value itself if String
    (a, b) =>
      path.resolve(repositoryRoot, isString(a) ? a : a.path) ===
      path.resolve(repositoryRoot, isString(b) ? b : b.path),
  );
}
