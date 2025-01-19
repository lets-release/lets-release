import { parse } from "git-log-parser";
import streamToArray from "stream-to-array";

import { getLogs } from "src/utils/git/getLogs";

vi.mock("git-log-parser");
vi.mock("stream-to-array");

const commits = [
  {
    message: "commit message",
    gitTags: "tag",
  },
];

describe("getLogs", () => {
  beforeEach(() => {
    vi.mocked(parse).mockClear();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    vi.mocked(streamToArray).mockResolvedValue(commits);
  });

  it("should get logs before some commit", async () => {
    await expect(getLogs("some-commit")).resolves.toEqual(commits);
    expect(parse).toHaveBeenCalledWith(
      { _: "some-commit" },
      { cwd: undefined, env: process.env },
    );
  });

  it("should get logs between two commits", async () => {
    await expect(getLogs("before", "after")).resolves.toEqual(commits);
    expect(parse).toHaveBeenCalledWith(
      { _: "after..before" },
      { cwd: undefined, env: process.env },
    );
  });
});
