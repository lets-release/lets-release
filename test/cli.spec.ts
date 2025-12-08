import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

import { $, Options } from "execa";
import { inject } from "vitest";

import { SECRET_REPLACEMENT } from "src/constants/SECRET_REPLACEMENT";
import { getNote } from "src/utils/git/getNote";
import { addFiles } from "test/__helpers__/git/addFiles.js";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { commit } from "test/__helpers__/git/commit.js";
import { createAndCloneRepo } from "test/__helpers__/git/createAndCloneRepo";
import { getRemoteTagHash } from "test/__helpers__/git/getRemoteTagHash";
import { mergeBranch } from "test/__helpers__/git/mergeBranch";
import { pushBranch } from "test/__helpers__/git/pushBranch";
import { writeFile as writeTestFile } from "test/__helpers__/writeFile";

const gitCredential = inject("gitCredential");
const registry = inject("registry");
const npmToken = inject("npmToken");

const {
  GITHUB_ACTION: _GITHUB_ACTION,
  GITHUB_ACTIONS: _GITHUB_ACTIONS,
  GITHUB_TOKEN: _GITHUB_TOKEN,
  ...processEnvWithoutGitHubActionsVariables
} = process.env;
const env = {
  ...processEnvWithoutGitHubActionsVariables,
  CI: "true",
  GH_TOKEN: gitCredential,
  TRAVIS: "true",
  TRAVIS_BRANCH: "main",
  TRAVIS_PULL_REQUEST: "false",
};
const root = path.resolve(import.meta.dirname, "../");
const cli = path.resolve(root, "./src/cli.ts");
const gitIgnore = path.resolve(root, ".gitignore");
const viteConfig = path.resolve(root, "./test/__fixtures__/vite.config.js");
const pluginError = path.resolve(
  root,
  "./test/__fixtures__/plugins/plugin-error.js",
);
const pluginLogEnv = path.resolve(
  root,
  "./test/__fixtures__/plugins/plugin-log-env.js",
);

describe("cli", () => {
  it("should release patch, minor and major versions", async () => {
    const packageName = "cli-test-release";
    const { cwd, url, authUrl } = await createAndCloneRepo(packageName);

    await copyFile(gitIgnore, path.resolve(cwd, ".gitignore"));
    await copyFile(viteConfig, path.resolve(cwd, "vite.config.js"));
    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(
        {
          name: packageName,
          version: "0.0.0-dev",
          type: "module",
          repository: { url },
          publishConfig: { registry },
          devDependencies: {
            "conventional-changelog-conventionalcommits": "^9.0.0",
            vite: "^6.0.7",
            "vite-node": "^2.1.8",
            "vite-tsconfig-paths": "^5.1.4",
          },
          release: {
            packages: [
              {
                paths: ["./"],
                versioning: { scheme: "SemVer" },
                plugins: [
                  "@lets-release/commit-analyzer",
                  "@lets-release/release-notes-generator",
                  "@lets-release/npm",
                ],
              },
            ],
            releaseCommit: {
              assets: ["package.json", "package-lock.json"],
            },
          },
        },
        null,
        2,
      ),
    );

    const options: Options = {
      cwd,
      env,
      preferLocal: true,
      reject: false,
      extendEnv: false,
    };

    await $(options)`npm install`;
    await checkoutBranch(cwd, "main");
    await addFiles(cwd);
    await commit(cwd, "chore: initial commit");
    await pushBranch(cwd, authUrl, "main");

    /* No release */
    const result = await $(options)`npx vite-node -c ${viteConfig} ${cli}`;

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "There are no relevant changes, so no new version is released",
    );

    const testRelease = async (
      version: string,
      {
        branch = "main",
        channel = null,
        mergedChannel,
      }: {
        branch?: string;
        channel?: string | null;
        mergedChannel?: string | null;
      } = {},
    ) => {
      const context = `${version} on ${branch}`;
      const distTag = channel ?? "latest";
      const result = await $({
        ...options,
        env: {
          ...env,
          TRAVIS_BRANCH: branch,
        },
      })`npx vite-node -c ${viteConfig} ${cli}`;

      expect(result.exitCode, context).toBe(0);
      expect(result.stdout, context).toContain(
        `${mergedChannel === undefined ? "Publishing" : "Adding"} version ${version} to npm registry on dist-tag ${distTag}`,
      );

      const buffer = await readFile(path.resolve(cwd, "package.json"));

      expect(JSON.parse(buffer.toString()), context).toEqual(
        expect.objectContaining({
          version,
        }),
      );

      if (mergedChannel !== undefined) {
        // Wait for 3s as the change of dist-tag takes time to be reflected in the registry
        await setTimeout(3000);
      }

      const viewResult = await $({
        cwd,
        preferLocal: true,
      })`npm view ${packageName} dist-tags --registry ${registry} --json`;

      expect(viewResult.exitCode, context).toBe(0);
      expect(JSON.parse(viewResult.stdout.trim()), context).toEqual(
        expect.objectContaining({
          [distTag]: version,
        }),
      );

      if (mergedChannel !== undefined) {
        return;
      }

      const hash = await $({
        cwd,
        preferLocal: true,
      })`git rev-parse HEAD`;
      const tagHash = await $({
        cwd,
        preferLocal: true,
      })`git rev-list -1 v${version}`;
      const remoteTagHash = await getRemoteTagHash(cwd, authUrl, `v${version}`);
      const note = await getNote(`v${version}`, { cwd });

      expect(tagHash.stdout?.trim(), context).toBe(hash.stdout?.trim());
      expect(remoteTagHash, context).toBe(hash.stdout?.trim());
      expect(note, context).toEqual(
        expect.objectContaining({
          artifacts: [
            expect.objectContaining({
              channels: [channel],
            }),
          ],
        }),
      );
    };

    /* Initial release */
    await writeTestFile(cwd, ["index.js"], "export default {}");
    await addFiles(cwd);
    await commit(cwd, "feat: add index.js");
    await testRelease("1.0.0");

    /* Patch release */
    await writeTestFile(cwd, ["index.js"], "export default { foo: 'bar' }");
    await addFiles(cwd);
    await commit(cwd, "fix: bar");
    await testRelease("1.0.1");

    /* Minor release */
    await writeTestFile(cwd, ["baz.js"], "export default {}");
    await addFiles(cwd);
    await commit(cwd, "feat: baz");
    await testRelease("1.1.0");

    /* Major release on next */
    await checkoutBranch(cwd, "next");
    await pushBranch(cwd, authUrl, "next");
    await writeTestFile(cwd, ["foo.js"], "export default {}");
    await addFiles(cwd);
    await commit(cwd, "feat: foo\n\nBREAKING CHANGE: bar");
    await testRelease("2.0.0", { branch: "next", channel: "next" });

    /* Merge next into master */
    await checkoutBranch(cwd, "main");
    await mergeBranch(cwd, "next");
    await pushBranch(cwd, authUrl, "main");
    await testRelease("2.0.0", { mergedChannel: "next" });
  });

  it("should handle renamed package release", async () => {
    const packageName = "cli-test-former-release";
    const { cwd, url, authUrl } = await createAndCloneRepo(packageName);

    await copyFile(gitIgnore, path.resolve(cwd, ".gitignore"));
    await copyFile(viteConfig, path.resolve(cwd, "vite.config.js"));
    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );

    const packageJsonFile = path.resolve(cwd, "package.json");
    const packageJsonContent = {
      name: packageName,
      version: "0.0.0-dev",
      type: "module",
      repository: { url },
      publishConfig: { registry },
      devDependencies: {
        "conventional-changelog-conventionalcommits": "^9.0.0",
        vite: "^6.0.7",
        "vite-node": "^2.1.8",
        "vite-tsconfig-paths": "^5.1.4",
      },
      release: {
        packages: [
          {
            paths: ["./"],
            versioning: { scheme: "SemVer" },
            plugins: [
              "@lets-release/commit-analyzer",
              "@lets-release/release-notes-generator",
              "@lets-release/npm",
            ],
          },
        ],
        releaseCommit: {
          assets: ["package.json", "package-lock.json"],
        },
      },
    };

    await writeFile(
      packageJsonFile,
      JSON.stringify(packageJsonContent, null, 2),
    );

    const options: Options = {
      cwd,
      env,
      preferLocal: true,
      reject: false,
      extendEnv: false,
    };

    await $(options)`npm install`;
    await checkoutBranch(cwd, "main");
    await addFiles(cwd);
    await commit(cwd, "chore: initial commit");
    await pushBranch(cwd, authUrl, "main");

    /* No release */
    const result = await $(options)`npx vite-node -c ${viteConfig} ${cli}`;

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "There are no relevant changes, so no new version is released",
    );

    const testRelease = async (
      pkgName: string,
      version: string,
      {
        branch = "main",
        channel = null,
        mergedChannel,
      }: {
        branch?: string;
        channel?: string | null;
        mergedChannel?: string | null;
      } = {},
    ) => {
      const context = `${version} on ${branch}`;
      const distTag = channel ?? "latest";
      const result = await $({
        ...options,
        env: {
          ...env,
          TRAVIS_BRANCH: branch,
        },
      })`npx vite-node -c ${viteConfig} ${cli}`;

      expect(result.exitCode, context).toBe(0);
      expect(result.stdout, context).toContain(
        `${mergedChannel === undefined ? "Publishing" : "Adding"} version ${version} to npm registry on dist-tag ${distTag}`,
      );

      const buffer = await readFile(path.resolve(cwd, "package.json"));

      expect(JSON.parse(buffer.toString()), context).toEqual(
        expect.objectContaining({
          version,
        }),
      );

      if (mergedChannel !== undefined) {
        // Wait for 3s as the change of dist-tag takes time to be reflected in the registry
        await setTimeout(3000);
      }

      const viewResult = await $({
        cwd,
        preferLocal: true,
      })`npm view ${pkgName} dist-tags --registry ${registry} --json`;

      expect(viewResult.exitCode, context).toBe(0);
      expect(JSON.parse(viewResult.stdout.trim()), context).toEqual(
        expect.objectContaining({
          [distTag]: version,
        }),
      );

      if (mergedChannel !== undefined) {
        return;
      }

      const hash = await $({
        cwd,
        preferLocal: true,
      })`git rev-parse HEAD`;
      const tagHash = await $({
        cwd,
        preferLocal: true,
      })`git rev-list -1 v${version}`;
      const remoteTagHash = await getRemoteTagHash(cwd, authUrl, `v${version}`);
      const note = await getNote(`v${version}`, { cwd });

      expect(tagHash.stdout?.trim(), context).toBe(hash.stdout?.trim());
      expect(remoteTagHash, context).toBe(hash.stdout?.trim());
      expect(note, context).toEqual(
        expect.objectContaining({
          artifacts: [
            expect.objectContaining({
              channels: [channel],
            }),
          ],
        }),
      );
    };

    /* Initial release */
    await writeTestFile(cwd, ["index.js"], "export default {}");
    await addFiles(cwd);
    await commit(cwd, "feat: add index.js");
    await testRelease(packageName, "1.0.0");

    const newPackageName = "cli-test-renamed-release";

    await writeFile(
      packageJsonFile,
      JSON.stringify(
        {
          ...packageJsonContent,
          name: newPackageName,
          "lets-release": {
            formerName: packageName,
          },
        },
        null,
        2,
      ),
    );

    /* Minor release */
    await writeTestFile(cwd, ["baz.js"], "export default {}");
    await addFiles(cwd);
    await commit(cwd, "feat: baz");
    await testRelease(newPackageName, "1.1.0");
  });

  it("should exit with 1 if a plugin is not found", async () => {
    const packageName = "cli-test-plugin-not-found";
    const { cwd, url, authUrl } = await createAndCloneRepo(packageName);

    await copyFile(gitIgnore, path.resolve(cwd, ".gitignore"));
    await copyFile(viteConfig, path.resolve(cwd, "vite.config.js"));
    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(
        {
          name: packageName,
          version: "0.0.0-dev",
          type: "module",
          repository: { url },
          publishConfig: { registry },
          devDependencies: {
            "conventional-changelog-conventionalcommits": "^9.0.0",
            vite: "^6.0.7",
            "vite-node": "^2.1.8",
            "vite-tsconfig-paths": "^5.1.4",
          },
          release: {
            packages: [
              {
                paths: ["./"],
                versioning: { scheme: "SemVer" },
                plugins: [
                  "@lets-release/commit-analyzer",
                  "@lets-release/release-notes-generator",
                  "@lets-release/npm",
                  "non-existing-plugin",
                ],
              },
            ],
            releaseCommit: {
              assets: ["package.json", "package-lock.json"],
            },
          },
        },
        null,
        2,
      ),
    );

    const options: Options = {
      cwd,
      env,
      preferLocal: true,
      reject: false,
      extendEnv: false,
    };

    await $(options)`npm install`;
    await checkoutBranch(cwd, "main");
    await addFiles(cwd);
    await commit(cwd, "chore: initial commit");
    await pushBranch(cwd, authUrl, "main");

    const result = await $(options)`npx vite-node -c ${viteConfig} ${cli}`;

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Cannot find module");
  });

  it("should run in dry-run mode", async () => {
    const packageName = "cli-test-dry-run";
    const { cwd, url, authUrl } = await createAndCloneRepo(packageName);

    await copyFile(gitIgnore, path.resolve(cwd, ".gitignore"));
    await copyFile(viteConfig, path.resolve(cwd, "vite.config.js"));
    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(
        {
          name: packageName,
          version: "0.0.0-dev",
          type: "module",
          repository: { url },
          publishConfig: { registry },
          devDependencies: {
            "conventional-changelog-conventionalcommits": "^9.0.0",
            vite: "^6.0.7",
            "vite-node": "^2.1.8",
            "vite-tsconfig-paths": "^5.1.4",
          },
          release: {
            packages: [
              {
                paths: ["./"],
                versioning: { scheme: "SemVer" },
                plugins: [
                  "@lets-release/commit-analyzer",
                  "@lets-release/release-notes-generator",
                  "@lets-release/npm",
                ],
              },
            ],
            releaseCommit: {
              assets: ["package.json", "package-lock.json"],
            },
          },
        },
        null,
        2,
      ),
    );

    const options: Options = {
      cwd,
      env: {
        ...processEnvWithoutGitHubActionsVariables,
        GH_TOKEN: gitCredential,
      },
      preferLocal: true,
      reject: false,
      extendEnv: false,
    };

    await $(options)`npm install`;
    await checkoutBranch(cwd, "main");
    await addFiles(cwd);
    await commit(cwd, "feat: initial commit");
    await pushBranch(cwd, authUrl, "main");

    const result = await $(
      options,
    )`npx vite-node -c ${viteConfig} ${cli} --dry-run`;
    const version = "1.0.0";

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      `There is no previous release, the next release version is ${version}`,
    );
    expect(result.stdout).toContain(`Release note for version ${version}`);
    expect(result.stdout).toContain(`initial commit`);

    const buffer = await readFile(path.resolve(cwd, "package.json"));

    expect(JSON.parse(buffer.toString())).toEqual(
      expect.objectContaining({
        version: "0.0.0-dev",
      }),
    );
  });

  it('should allow local releases with "skipCiVerifications" option', async () => {
    const packageName = "cli-test-skip-ci-verifications";
    const { cwd, url, authUrl } = await createAndCloneRepo(packageName);

    await copyFile(gitIgnore, path.resolve(cwd, ".gitignore"));
    await copyFile(viteConfig, path.resolve(cwd, "vite.config.js"));
    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(
        {
          name: packageName,
          version: "0.0.0-dev",
          type: "module",
          repository: { url },
          publishConfig: { registry },
          devDependencies: {
            "conventional-changelog-conventionalcommits": "^9.0.0",
            vite: "^6.0.7",
            "vite-node": "^2.1.8",
            "vite-tsconfig-paths": "^5.1.4",
          },
          release: {
            packages: [
              {
                paths: ["./"],
                versioning: { scheme: "SemVer" },
                plugins: [
                  "@lets-release/commit-analyzer",
                  "@lets-release/release-notes-generator",
                  "@lets-release/npm",
                ],
              },
            ],
            releaseCommit: {
              assets: ["package.json", "package-lock.json"],
            },
          },
        },
        null,
        2,
      ),
    );

    const options: Options = {
      cwd,
      env: {
        ...processEnvWithoutGitHubActionsVariables,
        GH_TOKEN: gitCredential,
      },
      preferLocal: true,
      reject: false,
      extendEnv: false,
    };

    await $(options)`npm install`;
    await checkoutBranch(cwd, "main");
    await addFiles(cwd);
    await commit(cwd, "feat: initial commit");
    await pushBranch(cwd, authUrl, "main");

    const result = await $(
      options,
    )`npx vite-node -c ${viteConfig} ${cli} --skip-ci-verifications`;
    const version = "1.0.0";

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      `Publishing version ${version} to npm registry on dist-tag latest`,
    );

    const buffer = await readFile(path.resolve(cwd, "package.json"));

    expect(JSON.parse(buffer.toString())).toEqual(
      expect.objectContaining({
        version,
      }),
    );

    const viewResult = await $({
      cwd,
      preferLocal: true,
    })`npm view ${packageName} dist-tags --registry ${registry} --json`;

    expect(viewResult.exitCode).toBe(0);
    expect(JSON.parse(viewResult.stdout.trim())).toEqual(
      expect.objectContaining({
        latest: version,
      }),
    );

    const hash = await $({
      cwd,
      preferLocal: true,
    })`git rev-parse HEAD`;
    const tagHash = await $({
      cwd,
      preferLocal: true,
    })`git rev-list -1 v${version}`;
    const remoteTagHash = await getRemoteTagHash(cwd, authUrl, `v${version}`);
    const note = await getNote(`v${version}`, { cwd });

    expect(tagHash.stdout?.trim()).toBe(hash.stdout?.trim());
    expect(remoteTagHash).toBe(hash.stdout?.trim());
    expect(note).toEqual(
      expect.objectContaining({
        artifacts: [
          expect.objectContaining({
            channels: [null],
          }),
        ],
      }),
    );
  });

  it("should log errors and exit with 1", async () => {
    const packageName = "cli-test-plugin-error";
    const { cwd, url, authUrl } = await createAndCloneRepo(packageName);

    await copyFile(gitIgnore, path.resolve(cwd, ".gitignore"));
    await copyFile(viteConfig, path.resolve(cwd, "vite.config.js"));
    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(
        {
          name: packageName,
          version: "0.0.0-dev",
          type: "module",
          repository: { url },
          publishConfig: { registry },
          devDependencies: {
            "conventional-changelog-conventionalcommits": "^9.0.0",
            vite: "^6.0.7",
            "vite-node": "^2.1.8",
            "vite-tsconfig-paths": "^5.1.4",
          },
          release: {
            packages: [
              {
                paths: ["./"],
                versioning: { scheme: "SemVer" },
                plugins: [
                  "@lets-release/commit-analyzer",
                  "@lets-release/release-notes-generator",
                  "@lets-release/npm",
                ],
                verifyConditions: [pluginError],
              },
            ],
            releaseCommit: {
              assets: ["package.json", "package-lock.json"],
            },
          },
        },
        null,
        2,
      ),
    );

    const options: Options = {
      cwd,
      env,
      preferLocal: true,
      reject: false,
      extendEnv: false,
    };

    await $(options)`npm install`;
    await checkoutBranch(cwd, "main");
    await addFiles(cwd);
    await commit(cwd, "feat: initial commit");
    await pushBranch(cwd, authUrl, "main");

    const result = await $(options)`npx vite-node -c ${viteConfig} ${cli}`;

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Error: a");
    expect(result.stderr).toContain("errorProperty: 'errorProperty'");
  });

  it("should exit with 1 if missing permission to push to the remote repository", async () => {
    const packageName = "cli-test-unauthorized";
    const { cwd, authUrl } = await createAndCloneRepo(packageName);

    await copyFile(gitIgnore, path.resolve(cwd, ".gitignore"));
    await copyFile(viteConfig, path.resolve(cwd, "vite.config.js"));
    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(
        {
          name: packageName,
          version: "0.0.0-dev",
          type: "module",
          publishConfig: { registry },
          devDependencies: {
            "conventional-changelog-conventionalcommits": "^9.0.0",
            vite: "^6.0.7",
            "vite-node": "^2.1.8",
            "vite-tsconfig-paths": "^5.1.4",
          },
          release: {
            packages: [
              {
                paths: ["./"],
                versioning: { scheme: "SemVer" },
                plugins: [
                  "@lets-release/commit-analyzer",
                  "@lets-release/release-notes-generator",
                  "@lets-release/npm",
                ],
              },
            ],
            releaseCommit: {
              assets: ["package.json", "package-lock.json"],
            },
          },
        },
        null,
        2,
      ),
    );

    const options: Options = {
      cwd,
      env: { ...env, GH_TOKEN: "user:wrong_pass" },
      preferLocal: true,
      reject: false,
      extendEnv: false,
    };

    await $(options)`npm install`;
    await checkoutBranch(cwd, "main");
    await addFiles(cwd);
    await commit(cwd, "feat: initial commit");
    await pushBranch(cwd, authUrl, "main");
    await $(
      options,
    )`git remote set-url origin ${authUrl.replace(/:[^:]+@/, ":wrong_pass@")}`;

    const result = await $(options)`npx vite-node -c ${viteConfig} ${cli}`;

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      "NoGitRepoPermissionError: Cannot push to the Git repository",
    );
  });

  it("should hide sensitive environment variable values from the logs", async () => {
    const packageName = "cli-test-log-secret";
    const { cwd, url, authUrl } = await createAndCloneRepo(packageName);

    await copyFile(gitIgnore, path.resolve(cwd, ".gitignore"));
    await copyFile(viteConfig, path.resolve(cwd, "vite.config.js"));
    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(
        {
          name: packageName,
          version: "0.0.0-dev",
          type: "module",
          repository: { url },
          publishConfig: { registry },
          devDependencies: {
            "conventional-changelog-conventionalcommits": "^9.0.0",
            vite: "^6.0.7",
            "vite-node": "^2.1.8",
            "vite-tsconfig-paths": "^5.1.4",
          },
          release: {
            packages: [
              {
                paths: ["./"],
                versioning: { scheme: "SemVer" },
                plugins: [
                  "@lets-release/commit-analyzer",
                  "@lets-release/release-notes-generator",
                  "@lets-release/npm",
                ],
                verifyConditions: [pluginLogEnv],
              },
            ],
            releaseCommit: {
              assets: ["package.json", "package-lock.json"],
            },
          },
        },
        null,
        2,
      ),
    );

    const options: Options = {
      cwd,
      env: { ...env, MY_TOKEN: "secret token" },
      preferLocal: true,
      reject: false,
      extendEnv: false,
    };

    await $(options)`npm install`;
    await checkoutBranch(cwd, "main");
    await addFiles(cwd);
    await commit(cwd, "feat: initial commit");
    await pushBranch(cwd, authUrl, "main");

    const result = await $(options)`npx vite-node -c ${viteConfig} ${cli}`;

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain(
      `Console: Exposing token ${SECRET_REPLACEMENT}`,
    );
    expect(result.stdout).toContain(
      `Log: Exposing token ${SECRET_REPLACEMENT}`,
    );
    expect(result.stderr).toContain(
      `Error: Console token ${SECRET_REPLACEMENT}`,
    );
    expect(result.stderr).toContain(
      `Throw error: Exposing token ${SECRET_REPLACEMENT}`,
    );
  });
});
