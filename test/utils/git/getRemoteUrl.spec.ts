import { getRemoteUrl } from "src/utils/git/getRemoteUrl";
import { cloneRepo } from "test/__helpers__/git/cloneRepo";
import { initRepo } from "test/__helpers__/git/initRepo";
import { initRepoAsRemote } from "test/__helpers__/git/initRepoAsRemote";

describe("getRemoteUrl", () => {
  it("should get the remote url", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await expect(getRemoteUrl("origin", { cwd })).resolves.toBe(url);
  });

  it("should get undefined if the remote url cannot be found", async () => {
    const cwd = await initRepo();

    await expect(getRemoteUrl("origin", { cwd })).resolves.toBeUndefined();
  });
});
