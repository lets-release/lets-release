import { CommonVersion } from "@lets-release/versioning";

export interface ParsedSemVer extends CommonVersion {
  major: number;
  minor: number;
  patch: number;
}
