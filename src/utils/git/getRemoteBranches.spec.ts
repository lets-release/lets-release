import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { getRemoteBranches } from "src/utils/git/getRemoteBranches";

vi.mock("execa");
vi.mock("strip-ansi");

const stdout = [
  " ",
  "refs/heads/a",
  "refs/heads/b",
  "",
  " origin/refs/heads/c ",
  "",
  " ",
  "",
  " origin/refs/heads/d ",
  "",
  "",
];
const exec = vi.fn().mockResolvedValue({ stdout });

vi.mocked($).mockReturnValue(exec as never);
vi.mocked(stripAnsi).mockImplementation((value) => value);

describe("getRemoteBranches", () => {
  it("should get modified files", async () => {
    await expect(getRemoteBranches("test")).resolves.toEqual(["c", "d"]);
    expect(vi.mocked($)).toHaveBeenCalledWith({
      lines: true,
    });
    expect(exec).toHaveBeenCalledOnce();
  });
});
