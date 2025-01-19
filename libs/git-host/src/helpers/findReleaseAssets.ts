import path from "node:path";

import { debug } from "debug";
import dirGlob from "dir-glob";
import { globby } from "globby";
import { isArray, isString, uniq } from "lodash-es";

import { BaseContext } from "@lets-release/config";

import { Asset } from "src/schemas/Asset";
import { AssetObject } from "src/schemas/AssetObject";
import { ReleaseAsset } from "src/types/ReleaseAsset";
import { ReleaseAssetObject } from "src/types/ReleaseAssetObject";

const namespace = "@lets-release/git-host";

export async function findReleaseAssets<
  T extends ReleaseAssetObject,
  U extends AssetObject,
>(
  { cwd }: Pick<BaseContext, "cwd">,
  asset: Asset<U>,
): Promise<ReleaseAsset<T>[]> {
  // Wrap single glob definition in Array
  let glob = isArray(asset)
    ? asset
    : isString(asset)
      ? [asset]
      : isString(asset.path)
        ? [asset.path]
        : asset.path;

  // FIXME: Temporary workaround for https://github.com/mrmlnc/fast-glob/issues/47
  glob = uniq([...(await dirGlob(glob, { cwd })), ...glob]);

  // Skip solo negated pattern (avoid to include every non js file with `!**/*.js`)
  if (glob.length === 1 && glob[0].startsWith("!")) {
    debug(namespace)(
      `skipping the negated glob ${glob[0]} as its alone in its group and would retrieve a large amount of files`,
    );

    return [];
  }

  const items = await globby(glob, {
    cwd,
    expandDirectories: false, // FIXME: Temporary workaround for https://github.com/mrmlnc/fast-glob/issues/47
    gitignore: false,
    dot: true,
    onlyFiles: false,
  });

  if (!isArray(asset) && !isString(asset)) {
    if (items.length > 1) {
      // If asset is an Object with a glob the `path` property that resolve to multiple files,
      // Output an Object definition for each file matched and set each one with:
      // - `path` of the matched file
      // - `name` based on the actual file name (to avoid assets with duplicate `name`)
      // - other properties of the original asset definition
      return items.map(
        (item) =>
          ({
            ...asset,
            path: item,
            name: path.basename(item),
          }) as ReleaseAsset<T>,
      );
    }

    // If asset is an Object, output an Object definition with:
    // - `path` of the matched file if there is one, or the original `path` definition (will be considered as a missing file)
    // - other properties of the original asset definition

    if (items.length === 1) {
      return [{ ...asset, path: items[0] }] as ReleaseAsset<T>[];
    }

    return (
      isString(asset.path)
        ? [asset]
        : asset.path.map((p) => ({ ...asset, path: p }))
    ) as ReleaseAsset<T>[];
  }

  if (items.length > 0) {
    // If asset is a String definition, output each files matched
    return items as ReleaseAsset<T>[];
  }

  // If asset is a String definition but no match is found, output the elements of the original glob (each one will be considered as a missing file)
  return glob as ReleaseAsset<T>[];
}
