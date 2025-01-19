import { Actor } from "src/types/Actor";
import { Connection } from "src/types/Connection";
import { LabelConnection } from "src/types/LabelConnection";
import { Milestone } from "src/types/Milestone";

// https://docs.github.com/en/graphql/reference/objects#issue
export interface Issue {
  __typename: string;
  activeLockReason?: string; // https://docs.github.com/en/graphql/reference/enums#lockreason
  author?: Actor;
  authorAssociation: string; // https://docs.github.com/en/graphql/reference/enums#commentauthorassociation
  body: string;
  closedAt?: string;
  comments: Connection;
  createdAt: string;
  id: string;
  labels?: LabelConnection;
  locked: boolean;
  milestone?: Milestone;
  number: number;
  state: string; // https://docs.github.com/en/graphql/reference/enums#issuestate
  title: string;
  updatedAt: string;
  url: string;
}
