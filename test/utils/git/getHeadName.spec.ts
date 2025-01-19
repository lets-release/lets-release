import { getHeadName } from "src/utils/git/getHeadName";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { commit } from "test/__helpers__/git/commit";
import { initRepo } from "test/__helpers__/git/initRepo";

describe("getHeadName", () => {
  it("should get the head name", async () => {
    const cwd = await initRepo();

    await checkoutBranch(cwd, "main");
    await commit(cwd, "Initial commit");

    await expect(getHeadName({ cwd })).resolves.toBe("main");
  });
});
