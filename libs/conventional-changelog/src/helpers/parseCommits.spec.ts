import {
  CommitParser,
  Commit as ParsedCommit,
} from "conventional-commits-parser";

import { Commit, Package } from "@lets-release/config";

import { parseCommits } from "src/helpers/parseCommits";

vi.mock("conventional-commits-parser");

const pkg = { uniqueName: "npm/pkg" } as unknown as Package;
const parserOptions = {};
const extraCommit = {
  test: "test",
};

vi.spyOn(CommitParser.prototype, "parse").mockReturnValue(
  extraCommit as unknown as ParsedCommit,
);

describe("parseCommits", () => {
  it("should parse commits", () => {
    expect(
      parseCommits(
        pkg,
        [
          {
            hash: "123",
            message: " ",
          },
          {
            hash: "456",
            message: "test",
          },
        ] as Commit[],
        parserOptions,
      ),
    ).toEqual([
      {
        rawMsg: "test",
        hash: "456",
        message: "test",
        ...extraCommit,
      },
    ]);
  });
});
