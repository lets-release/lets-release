import { Artifact } from "@lets-release/config";

import { GitHubArtifactInfo } from "src/types/GitHubArtifactInfo";

export interface GitHubArtifact
  extends Omit<Artifact, "name" | "url">, GitHubArtifactInfo {}
