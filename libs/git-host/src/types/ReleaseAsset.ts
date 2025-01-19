import { ReleaseAssetObject } from "src/types/ReleaseAssetObject";

export type ReleaseAsset<T extends ReleaseAssetObject> = string | T;
