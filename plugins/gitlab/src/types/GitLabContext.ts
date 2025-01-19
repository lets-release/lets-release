import { Gitlab } from "@gitbeaker/core";

import { ResolvedGitLabOptions } from "src/schemas/GitLabOptions";

export interface GitLabContext {
  gitlab: Gitlab;
  owner: string;
  repo: string;
  projectId: string;
  options: ResolvedGitLabOptions;
}
