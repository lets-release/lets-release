import { CommonVersion } from "@lets-release/versioning";

import { NormalizedSemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";

export interface ParsedSemVer extends CommonVersion {
  major: number;
  minor: number;
  patch: number;
  prereleaseOptions: NormalizedSemVerPrereleaseOptions;
}
