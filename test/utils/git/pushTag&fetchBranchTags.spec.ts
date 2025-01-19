import { fetchBranchTags } from "src/utils/git/fetchBranchTags";
import { getBranchTags } from "src/utils/git/getBranchTags";
import { pushTag } from "src/utils/git/pushTag";
import { addFiles } from "test/__helpers__/git/addFiles";
import { addTag } from "test/__helpers__/git/addTag";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { cloneRepo } from "test/__helpers__/git/cloneRepo";
import { commit } from "test/__helpers__/git/commit";
import { initRepoAndCheckoutRemoteHead } from "test/__helpers__/git/initRepoAndCheckoutRemoteHead";
import { initRepoAsRemote } from "test/__helpers__/git/initRepoAsRemote";
import { pushBranch } from "test/__helpers__/git/pushBranch";
import { writeFile } from "test/__helpers__/writeFile";

const tag = "v1.0.0";

describe("pushTag & fetchBranchTags", () => {
  it("should push tag and fetch tags", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file"]);
    await addFiles(cwd);
    const hash = await commit(cwd, "first commit");
    await writeFile(cwd, ["file2"]);
    await addFiles(cwd);
    await commit(cwd, "second commit");
    await pushBranch(cwd, url, "main");
    await addTag(cwd, tag);

    await pushTag(url, tag, { cwd });

    const repositoryRoot = await cloneRepo(url, "main");
    await fetchBranchTags(url, "main", "main", { cwd: repositoryRoot });
    await expect(
      getBranchTags("main", { cwd: repositoryRoot }),
    ).resolves.toContain("v1.0.0");

    await writeFile(cwd, ["file3"]);
    await addFiles(cwd);
    await commit(cwd, "third commit");
    await pushBranch(cwd, url, "main");

    const shallowRepoRoot = await cloneRepo(url, "main", 1);
    await fetchBranchTags(url, "main", "main", { cwd: shallowRepoRoot });
    await expect(
      getBranchTags("main", { cwd: shallowRepoRoot }),
    ).resolves.toContain("v1.0.0");

    const detachedRepoRoot = await initRepoAndCheckoutRemoteHead(url, hash);
    await fetchBranchTags(url, "main", "main", { cwd: detachedRepoRoot });
    await expect(
      getBranchTags("main", { cwd: detachedRepoRoot }),
    ).resolves.toContain("v1.0.0");
  });
});
