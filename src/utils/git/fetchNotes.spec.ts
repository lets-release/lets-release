import { $ } from "execa";

import { fetchNotes } from "src/utils/git/fetchNotes";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

const repositoryUrl = "https://github.com/owner/repo.git";

describe("fetchNotes", () => {
  beforeEach(() => {
    vi.mocked($).mockClear();
    exec.mockReset();
  });

  it("should fetch notes", async () => {
    exec
      .mockRejectedValueOnce(new Error("Unknown error"))
      .mockResolvedValueOnce({ stdout: "" });

    await fetchNotes(repositoryUrl);

    expect(vi.mocked($)).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenCalledTimes(2);
  });

  it("should fetch notes for shallow clone repo", async () => {
    await fetchNotes(repositoryUrl);

    expect(vi.mocked($)).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenCalledTimes(1);
  });
});
