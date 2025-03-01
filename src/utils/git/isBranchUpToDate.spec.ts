import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { getHeadHash } from "src/utils/git/getHeadHash";
import { isBranchUpToDate } from "src/utils/git/isBranchUpToDate";

vi.mock("execa");
vi.mock("strip-ansi");
vi.mock("src/utils/git/getHeadHash");

const exec = vi.fn();
const headHash = "abc123";

vi.mocked($).mockReturnValue(exec as never);
vi.mocked(stripAnsi).mockImplementation((value) => value);
vi.mocked(getHeadHash).mockResolvedValue(headHash);

describe("isBranchUpToDate", () => {
  const repositoryUrl = "https://example.com/repo.git";
  const branch = "main";
  const options = { cwd: "/path/to/repo" };

  beforeEach(() => {
    vi.mocked($).mockClear();
    exec.mockReset();
  });

  it("should return true if the branch is up to date", async () => {
    const remoteHash = "abc123";

    exec.mockResolvedValue({
      stdout: `${remoteHash}\trefs/heads/${branch}\n`,
    });

    const result = await isBranchUpToDate(repositoryUrl, branch, options);

    expect(result).toBe(true);
  });

  it("should return false if the branch is not up to date", async () => {
    const remoteHash = "def456";

    exec.mockResolvedValue({
      stdout: `${remoteHash}\trefs/heads/${branch}\n`,
    });

    const result = await isBranchUpToDate(repositoryUrl, branch, options);

    expect(result).toBe(false);
  });
});
