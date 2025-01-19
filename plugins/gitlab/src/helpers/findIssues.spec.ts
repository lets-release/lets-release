import { Gitlab } from "@gitbeaker/core";

import { findIssues } from "src/helpers/findIssues";

const all = vi.fn();
const gitlab = { Issues: { all } } as unknown as Gitlab;
const projectId = "owner/repo";
const options = {};

describe("findIssues", () => {
  it("should paginate through issues", async () => {
    all
      .mockResolvedValueOnce(Array.from({ length: 100 }).fill({}))
      .mockResolvedValueOnce(Array.from({ length: 50 }).fill({}));

    const result = await findIssues(gitlab, projectId, options);

    expect(all).toHaveBeenCalledTimes(2);
    expect(result.length).toBe(150);
  });
});
