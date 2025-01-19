import { $ } from "execa";

import { fetchBranchTags } from "src/utils/git/fetchBranchTags";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

const repositoryUrl = "https://github.com/owner/repo.git";
const branch = "main";
const ciBranch = "next";

describe("fetchBranchTags", () => {
  beforeEach(() => {
    vi.mocked($).mockClear();
    exec.mockReset();
  });

  it("should fetch branch tags", async () => {
    exec
      .mockResolvedValueOnce({ stdout: "main" })
      .mockRejectedValueOnce(new Error("Unknown error"))
      .mockResolvedValueOnce({ stdout: "" });

    await fetchBranchTags(repositoryUrl, branch, branch);

    expect(vi.mocked($)).toHaveBeenCalledTimes(3);
    expect(exec).toHaveBeenCalledTimes(3);
  });

  it("should fetch branch tags for shallow clone repo", async () => {
    exec
      .mockResolvedValueOnce({ stdout: "main" })
      .mockResolvedValueOnce({ stdout: "" });

    await fetchBranchTags(repositoryUrl, branch, ciBranch);

    expect(vi.mocked($)).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenCalledTimes(2);
  });
});
