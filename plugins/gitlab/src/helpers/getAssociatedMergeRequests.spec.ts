import { Gitlab } from "@gitbeaker/core";

import { getAssociatedMergeRequests } from "./getAssociatedMergeRequests";

const allMergeRequests = vi.fn();
const gitlab = { Commits: { allMergeRequests } } as unknown as Gitlab;
const projectId = "owner/repo";
const hash = "abc123";

describe("getAssociatedMergeRequests", () => {
  it("should return merged merge requests", async () => {
    const mockMergeRequests = [
      { state: "merged" },
      { state: "opened" },
      { state: "merged" },
    ];

    allMergeRequests.mockResolvedValue(mockMergeRequests);

    const result = await getAssociatedMergeRequests(gitlab, projectId, hash);

    expect(result).toEqual([{ state: "merged" }, { state: "merged" }]);
  });
});
