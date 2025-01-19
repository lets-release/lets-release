import { Gitlab, MergeRequestSchema } from "@gitbeaker/core";

import { getRelatedIssues } from "src/helpers/getRelatedIssues";

const project_id = "owner/repo";
const iid = 1234;
const relatedIssues = [
  { id: 1, state: "merged" },
  { id: 2, state: "closed" },
];
const allIssuesClosed = vi.fn().mockResolvedValue(relatedIssues);

describe("getRelatedIssues", () => {
  it("should get related issues", async () => {
    await expect(
      getRelatedIssues(
        {
          MergeRequests: {
            allIssuesClosed,
          },
        } as unknown as Gitlab,
        { project_id, iid } as unknown as MergeRequestSchema,
      ),
    ).resolves.toEqual([relatedIssues[1]]);

    expect(allIssuesClosed).toHaveBeenCalledWith(project_id, iid);
  });
});
