import { generateGetBatchCommitsQuery } from "src/helpers/generateGetBatchCommitsQuery";
import { getAssociatedPullRequests } from "src/helpers/getAssociatedPullRequests";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { getCommitQuery } from "src/queries/getCommitQuery";

vi.mock("src/LetsReleaseOctokit");

const graphql = vi.fn();
const octokit = { graphql } as unknown as LetsReleaseOctokit;
const owner = "test-owner";
const repo = "test-repo";
const shas = ["sha1", "sha2"];

vi.mocked(LetsReleaseOctokit).mockReturnValue(octokit);

describe("getAssociatedPullRequests", () => {
  beforeEach(() => {
    graphql.mockReset();
  });

  it("should return associated pull requests", async () => {
    graphql.mockResolvedValueOnce({
      repository: {
        commit1: {
          oid: "sha1",
          associatedPullRequests: {
            nodes: [{ id: "pr1" }],
            pageInfo: {
              endCursor: "cursor1",
              hasNextPage: false,
            },
          },
        },
        commit2: {
          oid: "sha2",
          associatedPullRequests: {
            nodes: [{ id: "pr2" }],
            pageInfo: {
              endCursor: "cursor2",
              hasNextPage: false,
            },
          },
        },
      },
    });

    const result = await getAssociatedPullRequests(octokit, owner, repo, shas);

    expect(result).toEqual([[{ id: "pr1" }], [{ id: "pr2" }]]);
    expect(graphql).toHaveBeenCalledWith(generateGetBatchCommitsQuery(shas), {
      owner,
      repo,
    });
  });

  it("should handle pagination correctly", async () => {
    graphql
      .mockResolvedValueOnce({
        repository: {
          commit1: {
            oid: "sha1",
            associatedPullRequests: {
              nodes: [{ id: "pr1" }],
              pageInfo: {
                endCursor: "cursor1",
                hasNextPage: true,
              },
            },
          },
        },
      })
      .mockResolvedValueOnce({
        repository: {
          commit: {
            associatedPullRequests: {
              nodes: [{ id: "pr2" }],
              pageInfo: {
                endCursor: "cursor2",
                hasNextPage: true,
              },
            },
          },
        },
      })
      .mockResolvedValueOnce({
        repository: {
          commit: {
            associatedPullRequests: {
              nodes: [{ id: "pr3" }],
              pageInfo: {
                endCursor: "cursor3",
                hasNextPage: false,
              },
            },
          },
        },
      });

    const result = await getAssociatedPullRequests(octokit, owner, repo, [
      "sha1",
    ]);

    expect(result).toEqual([[{ id: "pr1" }], [{ id: "pr2" }], [{ id: "pr3" }]]);
    expect(graphql).toHaveBeenCalledWith(
      generateGetBatchCommitsQuery(["sha1"]),
      { owner, repo },
    );
    expect(graphql).toHaveBeenCalledWith(getCommitQuery, {
      owner,
      repo,
      sha: "sha1",
      cursor: "cursor1",
    });
    expect(graphql).toHaveBeenCalledWith(getCommitQuery, {
      owner,
      repo,
      sha: "sha1",
      cursor: "cursor2",
    });
  });

  it("should return an empty array if no associated pull requests are found", async () => {
    graphql.mockResolvedValueOnce({
      repository: {
        commit1: {
          oid: "sha1",
          associatedPullRequests: {
            nodes: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          },
        },
      },
    });

    const result = await getAssociatedPullRequests(octokit, owner, repo, [
      "sha1",
    ]);

    expect(result).toEqual([]);
    expect(graphql).toHaveBeenCalledWith(
      generateGetBatchCommitsQuery(["sha1"]),
      { owner, repo },
    );
  });
});
