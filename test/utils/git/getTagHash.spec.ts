import { getTagHash } from "src/utils/git/getTagHash";
import { addFiles } from "test/__helpers__/git/addFiles";
import { addTag } from "test/__helpers__/git/addTag";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { cloneRepo } from "test/__helpers__/git/cloneRepo";
import { commit } from "test/__helpers__/git/commit";
import { initRepoAsRemote } from "test/__helpers__/git/initRepoAsRemote";
import { writeFile } from "test/__helpers__/writeFile";

describe("getTagHash", () => {
  it("should get the tag hash", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first commit");
    await addTag(cwd, "v1.0.0");
    await writeFile(cwd, ["file"]);
    await addFiles(cwd);
    await commit(cwd, "second commit");

    await expect(
      getTagHash("v1.0.0", {
        cwd,
      }),
    ).resolves.toMatch(/^[\da-f]{40}$/);
  });
});
