import { createRepo } from "src/helpers/createRepo";
import { GitBox } from "src/services/GitBox/GitBox";

describe("GitBox", () => {
  it("should start gitBox container and create repo", async () => {
    const gitBox = new GitBox("git-box-e2e", 8888);

    onTestFailed(async () => {
      await gitBox.stop();
    });

    await expect(gitBox.pull()).resolves.toBeUndefined();
    await expect(gitBox.start()).resolves.toBeUndefined();

    await expect(
      createRepo(
        gitBox.name,
        gitBox.host,
        gitBox.port,
        gitBox.gitCredential,
        "test",
      ),
    ).resolves.toEqual({
      url: `http://localhost:8888/git/test.git`,
      authUrl: `http://git_username:git_password@localhost:8888/git/test.git`,
    });
    await expect(gitBox.stop()).resolves.toBeUndefined();
  });
});
