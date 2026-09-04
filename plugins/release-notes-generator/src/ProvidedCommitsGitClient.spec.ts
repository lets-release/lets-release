import { Commit, Package } from "@lets-release/config";

import { ProvidedCommitsGitClient } from "src/ProvidedCommitsGitClient";

const pkg = {
  path: "/repo",
  uniqueName: "npm/pkg",
} as Package;

describe("ProvidedCommitsGitClient", () => {
  it("should provide the supplied commits as parsed commits", async () => {
    const client = new ProvidedCommitsGitClient("/repo", pkg, [
      {
        hash: "abc123",
        message: "fix(core): Fix a bug",
      },
    ] as Commit[]);

    const commits = [];
    for await (const commit of client.getCommits()) {
      commits.push(commit);
    }

    expect(commits).toHaveLength(1);
    expect(commits[0]).toMatchObject({
      hash: "abc123",
      message: "fix(core): Fix a bug",
      type: "fix",
      scope: "core",
      subject: "Fix a bug",
    });
  });

  it("should expose no tags and verify revisions without invoking git", async () => {
    const client = new ProvidedCommitsGitClient("/repo", pkg, []);

    await expect(client.verify("HEAD")).resolves.toBe("HEAD");

    const tags = [];
    for await (const tag of client.getSemverTags()) {
      tags.push(tag);
    }

    expect(tags).toEqual([]);
  });
});
