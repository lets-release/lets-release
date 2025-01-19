import { Actor } from "src/types/Actor";

export interface Milestone {
  closedAt?: string;
  createdAt: string;
  creator?: Omit<Actor, "__typename">;
  description?: string;
  id: string;
  number: number;
  state: string; // https://docs.github.com/en/graphql/reference/enums#milestonestate
  title: string;
  updatedAt: string;
  url: string;
}
