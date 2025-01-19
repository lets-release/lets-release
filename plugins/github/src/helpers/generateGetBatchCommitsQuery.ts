import { GRAPHQL_COMMIT_OBJECT } from "src/constants/GRAPHQL_COMMIT_OBJECT";

/**
 * Builds GraphQL query for fetching associated PRs to a list of commit hash (sha)
 */
export function generateGetBatchCommitsQuery(shas: string[]) {
  return `#graphql
    query getBatchCommits($owner: String!, $repo: String!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        ${shas
          .map(
            (sha) => `
              commit${sha.slice(0, 6)}: object(oid: "${sha}") {
                ${GRAPHQL_COMMIT_OBJECT}
              }
            `,
          )
          .join("")}
      }
    }
  `;
}
