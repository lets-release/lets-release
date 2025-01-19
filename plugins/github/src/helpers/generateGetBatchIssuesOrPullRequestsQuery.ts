import { GRAPHQL_ISSUE_FIELDS } from "src/constants/GRAPHQL_ISSUE_FIELDS";
import { GRAPHQL_PULL_REQUEST_FIELDS } from "src/constants/GRAPHQL_PULL_REQUEST_FIELDS";

/**
 * Builds GraphQL query for fetching PRs/Commits related Issues to a list of commit hash (sha)
 */
export function generateGetBatchIssuesOrPullRequestsQuery(numbers: number[]) {
  return `#graphql
    query getBatchIssuesOrPullRequests($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        ${numbers
          .map(
            (num) => `
              object${num}: issueOrPullRequest(number: ${num}) {
                ... on Issue {
                  ${GRAPHQL_ISSUE_FIELDS}
                }
                ... on PullRequest {
                  ${GRAPHQL_PULL_REQUEST_FIELDS}
                }
              }
            `,
          )
          .join("")}
      }
    }
  `;
}
