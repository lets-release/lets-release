// https://docs.github.com/en/graphql/reference/interfaces#actor
export interface Actor {
  __typename: string;
  avatarUrl: string;
  login: string;
  url: string;
}
