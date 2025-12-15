/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { RequestError } from "@octokit/request-error";

import { SuccessContext } from "@lets-release/config";

import { addComment } from "src/helpers/addComment";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { Issue } from "src/types/Issue";

const request = vi.fn();
const octokit = {
  request,
} as unknown as LetsReleaseOctokit;
const log = vi.fn();
const error = vi.fn();
const tag = "v1.0.0";
const context = {
  logger: {
    log,
    error,
  },
  nextRelease: { tag, version: "1.0.0" },
  releases: [
    {
      tag,
      artifacts: [{ name: "release" }],
    },
  ],
  package: {
    name: "pkg",
    uniqueName: "npm/pkg",
  },
} as unknown as SuccessContext;
const issue = {
  __typename: "Issue",
  number: 1,
} as Issue;

describe("addComment", () => {
  beforeEach(() => {
    request.mockReset();
    log.mockReset();
    error.mockReset();
  });

  it("should skip commenting if commentOnSuccess returns false", async () => {
    const commentOnSuccess = vi.fn().mockReturnValue(false);

    const errors = await addComment(
      context,
      octokit,
      { commentOnSuccess, successComment: "", successLabels: [] },
      "owner",
      "repo",
      issue,
    );

    expect(commentOnSuccess).toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Skip commenting to issue #1.",
    });
    expect(errors).toEqual([]);
  });

  it("should add a comment and labels to the issue", async () => {
    const commentOnSuccess = vi.fn().mockReturnValue(true);
    const successComment = "Success!";
    const successLabels = ["label1", "label2"];

    request
      .mockResolvedValueOnce({ data: { html_url: "http://example.com" } })
      .mockResolvedValueOnce({});

    const errors = await addComment(
      context,
      octokit,
      { commentOnSuccess, successComment, successLabels },
      "owner",
      "repo",
      issue,
    );

    expect(request).toHaveBeenNthCalledWith(
      1,
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      { owner: "owner", repo: "repo", issue_number: 1, body: "Success!" },
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
      {
        owner: "owner",
        repo: "repo",
        issue_number: 1,
        data: ["label1", "label2"],
      },
    );
    expect(log).toHaveBeenNthCalledWith(1, {
      prefix: "[npm/pkg]",
      message: "Added comment to issue #1: http://example.com",
    });
    expect(log).toHaveBeenNthCalledWith(2, {
      prefix: "[npm/pkg]",
      message: ["Added labels %O to issue #1", ["label1", "label2"]],
    });
    expect(errors).toEqual([]);
  });

  it("should add a comment and labels to the issue with default success comment", async () => {
    const commentOnSuccess = vi.fn().mockReturnValue(true);
    const successComment = undefined;
    const successLabels = ["label1", "label2"];

    request
      .mockResolvedValueOnce({ data: { html_url: "http://example.com" } })
      .mockResolvedValueOnce({});

    const errors = await addComment(
      context,
      octokit,
      { commentOnSuccess, successComment, successLabels },
      "owner",
      "repo",
      { ...issue, __typename: "PullRequest" },
    );

    expect(request).toHaveBeenNthCalledWith(
      1,
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner: "owner",
        repo: "repo",
        issue_number: 1,
        body: expect.stringContaining(
          ":tada: This PR is included in pkg version 1.0.0 :tada:",
        ),
      },
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
      {
        owner: "owner",
        repo: "repo",
        issue_number: 1,
        data: ["label1", "label2"],
      },
    );
    expect(log).toHaveBeenNthCalledWith(1, {
      prefix: "[npm/pkg]",
      message: "Added comment to PR #1: http://example.com",
    });
    expect(log).toHaveBeenNthCalledWith(2, {
      prefix: "[npm/pkg]",
      message: ["Added labels %O to PR #1", ["label1", "label2"]],
    });
    expect(errors).toEqual([]);
  });

  it("should add comment without labels when successLabels is empty", async () => {
    const commentOnSuccess = vi.fn().mockReturnValue(true);
    const successComment = "Success!";
    const successLabels: string[] = [];

    request.mockResolvedValueOnce({ data: { html_url: "http://example.com" } });

    const errors = await addComment(
      context,
      octokit,
      { commentOnSuccess, successComment, successLabels },
      "owner",
      "repo",
      issue,
    );

    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      { owner: "owner", repo: "repo", issue_number: 1, body: "Success!" },
    );
    expect(log).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Added comment to issue #1: http://example.com",
    });
    expect(errors).toEqual([]);
  });

  it("should handle RequestError with status 403", async () => {
    const commentOnSuccess = vi.fn().mockReturnValue(true);
    const successComment = "Success!";
    const successLabels = ["label1", "label2"];

    request.mockRejectedValueOnce(
      new RequestError("Forbidden", 403, {
        request: { method: "POST", url: "/abc", headers: {} },
        response: {
          status: 403,
          url: "/abc",
          headers: {},
          data: {},
          retryCount: 1,
        },
      }),
    );

    const errors = await addComment(
      context,
      octokit,
      { commentOnSuccess, successComment, successLabels },
      "owner",
      "repo",
      issue,
    );

    expect(error).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Not allowed to add a comment to the issue #1.",
    });
    expect(errors).toEqual([]);
  });

  it("should handle RequestError with status 404", async () => {
    const commentOnSuccess = vi.fn().mockReturnValue(true);
    const successComment = "Success!";
    const successLabels = ["label1", "label2"];

    request.mockRejectedValueOnce(
      new RequestError("Not Found", 404, {
        request: { method: "POST", url: "/abc", headers: {} },
        response: {
          status: 404,
          url: "/abc",
          headers: {},
          data: {},
          retryCount: 1,
        },
      }),
    );

    const errors = await addComment(
      context,
      octokit,
      { commentOnSuccess, successComment, successLabels },
      "owner",
      "repo",
      issue,
    );

    expect(error).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Failed to add a comment to the issue #1 as it doesn't exist.",
    });
    expect(errors).toEqual([]);
  });

  it("should handle unknown errors", async () => {
    const commentOnSuccess = vi.fn().mockReturnValue(true);
    const successComment = "Success!";
    const successLabels = ["label1", "label2"];
    const unknownError = new Error("Unknown error");

    request.mockRejectedValueOnce(unknownError);

    const errors = await addComment(
      context,
      octokit,
      { commentOnSuccess, successComment, successLabels },
      "owner",
      "repo",
      issue,
    );

    expect(error).toHaveBeenCalledWith({
      prefix: "[npm/pkg]",
      message: "Failed to add a comment to the issue #1.",
    });
    expect(errors).toEqual([unknownError]);
  });
});
