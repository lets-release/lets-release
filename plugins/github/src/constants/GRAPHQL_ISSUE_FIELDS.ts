export const GRAPHQL_ISSUE_FIELDS = `#graphql
  __typename
  id
  title
  body
  url
  number
  createdAt
  updatedAt
  closedAt
  comments {
    totalCount
  }
  state
  author {
    login
    url
    avatarUrl
    __typename
  }
  authorAssociation
  activeLockReason
  labels(first: 40) {
    nodes {
      id
      url
      name
      color
      description
      isDefault
    }
  }
  milestone {
    url
    id
    number
    state
    title
    description
    creator {
      login
      url
      avatarUrl
    }
    createdAt
    closedAt
    updatedAt
  }
  locked
`;
