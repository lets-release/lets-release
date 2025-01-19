import { Gitlab, MergeRequestSchema } from "@gitbeaker/core";

export async function getRelatedIssues(
  gitlab: Gitlab,
  { project_id, iid }: MergeRequestSchema,
) {
  const relatedIssues = await gitlab.MergeRequests.allIssuesClosed(
    project_id,
    iid,
  );

  return relatedIssues.filter((x) => x.state === "closed");
}
