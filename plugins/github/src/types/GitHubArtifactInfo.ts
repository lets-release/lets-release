import { ArtifactInfo } from "@lets-release/config";

export interface GitHubArtifactInfo extends Required<ArtifactInfo> {
  id: number;
  discussion_url?: string;
}
