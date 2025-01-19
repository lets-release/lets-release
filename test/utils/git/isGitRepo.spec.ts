import { temporaryDirectory } from "tempy";

import { isGitRepo } from "src/utils/git/isGitRepo";
import { initRepo } from "test/__helpers__/git/initRepo";

describe("isGitRepo", () => {
  it("should return true if the directory is a git repository", async () => {
    const cwd = await initRepo();

    await expect(isGitRepo({ cwd })).resolves.toBe(true);
  });

  it("should return false if the directory is not a git repository", async () => {
    const cwd = temporaryDirectory();

    await expect(isGitRepo({ cwd })).resolves.toBe(false);
  });
});
