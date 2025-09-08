import { getRemoteBranches } from "src/utils/git/getRemoteBranches";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { cloneRepo } from "test/__helpers__/git/cloneRepo";
import { commit } from "test/__helpers__/git/commit";
import { initRepoAsRemote } from "test/__helpers__/git/initRepoAsRemote";
import { pushBranch } from "test/__helpers__/git/pushBranch";

describe("getRemoteBranches", () => {
  test("should return empty array if there are no branches", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await expect(getRemoteBranches(url, { cwd })).resolves.toEqual([]);
  });

  it("should get all the repository branches", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first commit");
    await pushBranch(cwd, url, "main");
    await checkoutBranch(cwd, "dev");
    await commit(cwd, "second commit");
    await pushBranch(cwd, url, "dev");
    await checkoutBranch(cwd, "other");
    await commit(cwd, "third commit");
    await pushBranch(cwd, url, "other");

    const branches = await getRemoteBranches(url, { cwd });

    expect(branches.toSorted()).toEqual(["dev", "main", "other"]);
  });
});
