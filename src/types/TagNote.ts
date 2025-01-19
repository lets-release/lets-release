import { VersionTag } from "@lets-release/config";

export type TagNote = Partial<Pick<VersionTag, "artifacts">>;
