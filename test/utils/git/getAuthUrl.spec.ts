import { inject } from "vitest";

import { getAuthUrl } from "src/utils/git/getAuthUrl";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { commit } from "test/__helpers__/git/commit";
import { createAndCloneRepo } from "test/__helpers__/git/createAndCloneRepo";

const gitCredential = inject("gitCredential");

describe("getAuthUrl", () => {
  it("should use the valid git credentials when multiple are provided", async () => {
    const packageName = "test-get-auth-url";
    const { cwd, url, authUrl } = await createAndCloneRepo(packageName);
    await checkoutBranch(cwd, "main");
    await commit(cwd, "feat: initial commit");

    await expect(
      getAuthUrl(url.replace("http://", "http://toto@"), "main", {
        cwd,
        env: {
          GITHUB_TOKEN: "dummy",
          GITLAB_TOKEN: "trash",
          BB_TOKEN_BASIC_AUTH: gitCredential,
          GIT_ASKPASS: "echo",
          GIT_TERMINAL_PROMPT: 0 as never,
          GIT_CONFIG_PARAMETERS: "'credential.helper='",
        },
      }),
    ).resolves.toBe(authUrl);
  });

  it("should use the repository URL as is if none of the given git credentials are valid", async () => {
    const packageName = "test-get-auth-url-invalid";
    const { cwd, url } = await createAndCloneRepo(packageName);
    await checkoutBranch(cwd, "main");
    await commit(cwd, "feat: initial commit");
    const dummyUrl = url.replace("http://", "http://toto@");

    await expect(
      getAuthUrl(dummyUrl, "main", {
        cwd,
        env: {
          GITHUB_TOKEN: "dummy",
          GITLAB_TOKEN: "trash",
          GIT_ASKPASS: "echo",
          GIT_TERMINAL_PROMPT: 0 as never,
          GIT_CONFIG_PARAMETERS: "'credential.helper='",
        },
      }),
    ).resolves.toBe(dummyUrl);
  });
});
