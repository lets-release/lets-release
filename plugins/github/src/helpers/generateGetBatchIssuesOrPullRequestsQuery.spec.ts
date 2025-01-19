import { GRAPHQL_ISSUE_FIELDS } from "src/constants/GRAPHQL_ISSUE_FIELDS";
import { GRAPHQL_PULL_REQUEST_FIELDS } from "src/constants/GRAPHQL_PULL_REQUEST_FIELDS";
import { generateGetBatchIssuesOrPullRequestsQuery } from "src/helpers/generateGetBatchIssuesOrPullRequestsQuery";

describe("generateGetBatchIssuesOrPullRequestsQuery", () => {
  it("should generate a valid GraphQL query for a single issue number", () => {
    const numbers = [1];
    const query = generateGetBatchIssuesOrPullRequestsQuery(numbers);

    expect(query).toContain(`object1: issueOrPullRequest(number: 1)`);
    expect(query).toContain(GRAPHQL_ISSUE_FIELDS);
    expect(query).toContain(GRAPHQL_PULL_REQUEST_FIELDS);
  });

  it("should generate a valid GraphQL query for multiple issue numbers", () => {
    const numbers = [1, 2, 3];
    const query = generateGetBatchIssuesOrPullRequestsQuery(numbers);

    for (const num of numbers) {
      expect(query).toContain(
        `object${num}: issueOrPullRequest(number: ${num})`,
      );
    }
    expect(query).toContain(GRAPHQL_ISSUE_FIELDS);
    expect(query).toContain(GRAPHQL_PULL_REQUEST_FIELDS);
  });

  it("should return an empty query when no issue numbers are provided", () => {
    const numbers: number[] = [];
    const query = generateGetBatchIssuesOrPullRequestsQuery(numbers);

    expect(query).not.toContain("object");
    expect(query).toContain("repository(owner: $owner, name: $repo)");
  });

  it("should handle large numbers of issue numbers", () => {
    const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
    const query = generateGetBatchIssuesOrPullRequestsQuery(numbers);

    for (const num of numbers) {
      expect(query).toContain(
        `object${num}: issueOrPullRequest(number: ${num})`,
      );
    }
    expect(query).toContain(GRAPHQL_ISSUE_FIELDS);
    expect(query).toContain(GRAPHQL_PULL_REQUEST_FIELDS);
  });
});
