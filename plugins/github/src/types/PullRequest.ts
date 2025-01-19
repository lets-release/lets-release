import { Actor } from "src/types/Actor";
import { Connection } from "src/types/Connection";
import { Issue } from "src/types/Issue";

export interface PullRequest extends Issue {
  changedFiles: number;
  commits: Connection;
  isDraft: boolean;
  mergeable: string; // https://docs.github.com/en/graphql/reference/enums#mergeablestate
  mergedAt?: string;
  mergedBy?: Omit<Actor, "__typename">;
}
