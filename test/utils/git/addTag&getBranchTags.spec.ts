import { addTag } from "src/utils/git/addTag";
import { getBranchTags } from "src/utils/git/getBranchTags";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { commit } from "test/__helpers__/git/commit";
import { initRepo } from "test/__helpers__/git/initRepo";

describe("addTag & getBranchTags", () => {
  it("should add tag and get branch tags", async () => {
    const cwd = await initRepo();

    await checkoutBranch(cwd, "main");
    const hash = await commit(cwd, "Initial commit");
    await addTag(hash, "v1.0.0", { cwd });

    await expect(getBranchTags("main", { cwd })).resolves.toEqual(["v1.0.0"]);
  });
});
