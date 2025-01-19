import { PullRequestConnection } from "src/types/PullRequestConnection";

// https://docs.github.com/en/graphql/reference/objects#commit
export interface Commit {
  oid: string;
  associatedPullRequests: PullRequestConnection;
}
