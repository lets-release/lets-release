import { CommonVersion } from "@lets-release/versioning";

import { NormalizedCalVerPrereleaseOptions } from "src/schemas/CalVerPrereleaseOptions";
import { CalVerFormatTokens } from "src/types/CalVerFormatTokens";
import { CalVerTokenValues } from "src/types/CalVerTokenValues";

export interface ParsedCalVer extends CommonVersion {
  tokens: CalVerFormatTokens;
  tokenValues: CalVerTokenValues;
  prereleaseOptions: NormalizedCalVerPrereleaseOptions;
}
