import { CommitBase } from "conventional-commits-parser";

import { Commit } from "@lets-release/config";

export interface ParsedCommit extends Omit<Commit, "body">, CommitBase {
  rawMsg: string;
  type: string;
  scope?: string;
}
