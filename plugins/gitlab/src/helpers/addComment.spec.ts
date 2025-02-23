import { Gitlab, IssueSchema, MergeRequestSchema } from "@gitbeaker/core";
import { GitbeakerRequestError } from "@gitbeaker/requester-utils";

import { SuccessContext } from "@lets-release/config";

import { addComment } from "src/helpers/addComment";
import { ResolvedGitLabOptions } from "src/schemas/GitLabOptions";

const log = vi.fn();
const error = vi.fn();
const tag = "v1.0.0";
const context = {
  logger: { log, error },
  package: {
    uniqueName: "npm/pkg",
  },
  nextRelease: { tag },
  releases: [
    {
      tag,
      artifacts: [{ name: "artifact1" }, { name: "artifact2" }],
    },
  ],
} as unknown as SuccessContext;
const createMRNotes = vi.fn();
const createIssueNotes = vi.fn();
const editMR = vi.fn();
const editIssue = vi.fn();
const gitlab = {
  MergeRequestNotes: { create: createMRNotes },
  IssueNotes: { create: createIssueNotes },
  MergeRequests: { edit: editMR },
  Issues: { edit: editIssue },
} as unknown as Gitlab;
const options = {
  commentOnSuccess: true,
} as unknown as ResolvedGitLabOptions;
const issue = {
  project_id: 1,
  iid: 1,
} as IssueSchema;
const mergeRequest = {
  project_id: 1,
  iid: 1,
  isMergeRequest: true,
} as unknown as MergeRequestSchema;

describe("addComment", () => {
  beforeEach(() => {
    log.mockClear();
    error.mockClear();
    createMRNotes.mockClear();
    createIssueNotes.mockClear();
    editMR.mockClear();
    editIssue.mockClear();
  });

  it("should skip commenting if commentOnSuccess returns false", async () => {
    const commentOnSuccess = vi.fn().mockReturnValue(false);

    await addComment(context, gitlab, { ...options, commentOnSuccess }, issue);

    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Skip commenting to issue #1.",
    });
    expect(createIssueNotes).not.toHaveBeenCalled();
  });

  it("should add a comment to an issue with default message", async () => {
    await addComment(context, gitlab, options, issue);

    expect(createIssueNotes).toHaveBeenCalledWith(
      1,
      1,
      expect.stringContaining(
        "Your **[lets-release][]** bot :package::rocket:",
      ),
    );
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Added comment to issue #1",
    });
  });

  it("should add a comment to a merge request with custom message", async () => {
    await addComment(
      context,
      gitlab,
      { ...options, successComment: "message" },
      mergeRequest,
    );

    expect(createMRNotes).toHaveBeenCalledWith(1, 1, "message");
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Added comment to MR #1",
    });
  });

  it("should add labels to merge request if successLabels are provided", async () => {
    const successLabels = ["label1", "label2"];

    await addComment(
      context,
      gitlab,
      { ...options, successLabels },
      mergeRequest,
    );

    expect(editMR).toHaveBeenCalledWith(1, 1, {
      add_labels: "label1,label2",
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: ["Added labels %O to MR #1", ["label1", "label2"]],
    });
  });

  it("should add labels to issue if successLabels are provided", async () => {
    const successLabels = ["label1", "label2"];

    await addComment(context, gitlab, { ...options, successLabels }, issue);

    expect(editIssue).toHaveBeenCalledWith(1, 1, {
      add_labels: "label1,label2",
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: ["Added labels %O to issue #1", ["label1", "label2"]],
    });
  });

  it("should handle 403 error when adding a comment", async () => {
    const e = new GitbeakerRequestError("Forbidden", {
      cause: { response: { status: 403 } },
    } as never);
    createIssueNotes.mockRejectedValueOnce(e);

    await addComment(context, gitlab, options, issue);

    expect(error).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Not allowed to add a comment to the issue #1.",
    });
  });

  it("should handle 404 error when adding a comment", async () => {
    const e = new GitbeakerRequestError("Not Found", {
      cause: { response: { status: 404 } },
    } as never);
    createIssueNotes.mockRejectedValueOnce(e);

    await addComment(context, gitlab, options, issue);

    expect(error).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Failed to add a comment to the issue #1 as it doesn't exist.",
    });
  });

  it("should handle other errors when adding a comment", async () => {
    const e = new Error("Unknown error");
    createIssueNotes.mockRejectedValueOnce(e);

    const errors = await addComment(context, gitlab, options, issue);

    expect(errors).toContain(e);
    expect(error).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Failed to add a comment to the issue #1.",
    });
  });
});
