import { PullRequest } from "src/types/PullRequest";

export interface PullRequestConnection {
  pageInfo: {
    endCursor?: string;
    hasNextPage: boolean;
  };
  nodes: PullRequest[];
}
