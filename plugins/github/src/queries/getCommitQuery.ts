import { GRAPHQL_COMMIT_OBJECT } from "src/constants/GRAPHQL_COMMIT_OBJECT";

/**
 * GraphQL Query to fetch additional associatedPR for commits that has more than 100 associatedPRs
 */
export const getCommitQuery = `#graphql
  query getCommit($owner: String!, $repo: String!, $sha: String!, $cursor: String) {
    repository(owner: $owner, name: $repo) {
      commit: object(oid: $sha) {
        ${GRAPHQL_COMMIT_OBJECT}
      }
    }
  }
`;
