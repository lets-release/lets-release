import { GRAPHQL_COMMIT_OBJECT } from "src/constants/GRAPHQL_COMMIT_OBJECT";
import { generateGetBatchCommitsQuery } from "src/helpers/generateGetBatchCommitsQuery";

describe("generateGetBatchCommitsQuery", () => {
  it("should generate a valid GraphQL query for a single SHA", () => {
    const shas = ["abc123"];
    const query = generateGetBatchCommitsQuery(shas);

    expect(query).toContain(
      "query getBatchCommits($owner: String!, $repo: String!, $cursor: String)",
    );
    expect(query).toContain("repository(owner: $owner, name: $repo)");
    expect(query).toContain(`commitabc123: object(oid: "abc123")`);
    expect(query).toContain(GRAPHQL_COMMIT_OBJECT);
  });

  it("should generate a valid GraphQL query for multiple SHAs", () => {
    const shas = ["abc123", "def456"];
    const query = generateGetBatchCommitsQuery(shas);

    expect(query).toContain(
      "query getBatchCommits($owner: String!, $repo: String!, $cursor: String)",
    );
    expect(query).toContain("repository(owner: $owner, name: $repo)");
    expect(query).toContain(`commitabc123: object(oid: "abc123")`);
    expect(query).toContain(`commitdef456: object(oid: "def456")`);
    expect(query).toContain(GRAPHQL_COMMIT_OBJECT);
  });

  it("should handle an empty array of SHAs", () => {
    const shas: string[] = [];
    const query = generateGetBatchCommitsQuery(shas);

    expect(query).toContain(
      "query getBatchCommits($owner: String!, $repo: String!, $cursor: String)",
    );
    expect(query).toContain("repository(owner: $owner, name: $repo)");
    expect(query).not.toContain("commit");
  });
});
