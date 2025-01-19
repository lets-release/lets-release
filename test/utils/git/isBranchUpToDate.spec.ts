import { isBranchUpToDate } from "src/utils/git/isBranchUpToDate";
import { addFiles } from "test/__helpers__/git/addFiles";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { cloneRepo } from "test/__helpers__/git/cloneRepo";
import { commit } from "test/__helpers__/git/commit";
import { initRepoAsRemote } from "test/__helpers__/git/initRepoAsRemote";
import { pushBranch } from "test/__helpers__/git/pushBranch";
import { writeFile } from "test/__helpers__/writeFile";

describe("isBranchUpToDate", () => {
  it("should return true if the branch is up to date", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first commit");
    await pushBranch(cwd, url, "main");

    await expect(isBranchUpToDate(url, "main", { cwd })).resolves.toBe(true);
  });

  it("should return false if the branch is not up to date", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first commit");
    await pushBranch(cwd, url, "main");
    await writeFile(cwd, ["file1"]);
    await addFiles(cwd);
    await commit(cwd, "second commit");

    await expect(isBranchUpToDate(url, "main", { cwd })).resolves.toBe(false);
  });
});
