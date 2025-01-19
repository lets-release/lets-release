import { getHeadHash } from "src/utils/git/getHeadHash";
import { addFiles } from "test/__helpers__/git/addFiles";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { commit } from "test/__helpers__/git/commit";
import { initRepo } from "test/__helpers__/git/initRepo";
import { writeFile } from "test/__helpers__/writeFile";

describe("getHeadHash", () => {
  it("should throw error if the last commit hash cannot be found", async () => {
    const cwd = await initRepo();

    await expect(
      getHeadHash({
        cwd,
      }),
    ).rejects.toThrow();
  });

  it("should get the head hash", async () => {
    const cwd = await initRepo();

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file"]);
    await addFiles(cwd);
    await commit(cwd, "Add file file");
    await writeFile(cwd, ["a", "file"]);
    await addFiles(cwd);
    await commit(cwd, "Add file a/file");
    await writeFile(cwd, ["b", "file"]);
    await addFiles(cwd);
    await commit(cwd, "Add file b/file");

    await expect(
      getHeadHash({
        cwd,
      }),
    ).resolves.toMatch(/^[\da-f]{40}$/);
  });
});
