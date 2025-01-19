import { GRAPHQL_PULL_REQUEST_FIELDS } from "src/constants/GRAPHQL_PULL_REQUEST_FIELDS";

export const GRAPHQL_COMMIT_OBJECT = `#graphql
  ...on Commit {
    oid
    associatedPullRequests(after: $cursor, first: 100) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        ${GRAPHQL_PULL_REQUEST_FIELDS}
      }
    }
  }
`;
