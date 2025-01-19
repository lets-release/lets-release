import { GRAPHQL_ISSUE_FIELDS } from "src/constants/GRAPHQL_ISSUE_FIELDS";

export const GRAPHQL_PULL_REQUEST_FIELDS = `#graphql
  ${GRAPHQL_ISSUE_FIELDS}
  mergeable
  changedFiles
  mergedAt
  isDraft
  mergedBy {
    login
    avatarUrl
    url
  }
  commits {
    totalCount
  }
`;
