/* eslint-disable unicorn/consistent-function-scoping */
import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson, pathExists, readJson } from "fs-extra";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { PublishContext } from "@lets-release/config";

import { NPM_ARTIFACT_NAME } from "src/constants/NPM_ARTIFACT_NAME";
import { publish } from "src/steps/publish";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const registry = inject("registry");
const registryHost = inject("registryHost");
const npmToken = inject("npmToken");
const stdout = new WritableStreamBuffer();
const stderr = new WritableStreamBuffer();
const log = vi.fn();
const warn = vi.fn();
const logger = { log, warn };
const context = {
  stdout,
  stderr,
  logger,
};

describe("publish", () => {
  it('should skip publish if "skipPublishing" is true', async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      name: "skip-publish-npm-publish",
      version: "0.0.0",
      publishConfig: { registry },
    };
    await outputJson(path.resolve(cwd, "package.json"), pkg);
    await $({ cwd })`corepack use npm@latest`;
    await $({ cwd })`npm install`;

    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: NpmPackageContext) => {
      pkgContext = context;
    };

    const result = await publish(
      {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env: process.env,
        repositoryRoot: cwd,
        options: {},
        package: {
          ...pkg,
          path: cwd,
        },
        nextRelease: { channels: [null], version: "1.0.0" },
      } as unknown as PublishContext,
      { skipPublishing: true, tarballDir: "tarball" },
    );

    expect(result).toBeUndefined();

    await expect(readJson(path.resolve(cwd, "package.json"))).resolves.toEqual(
      expect.objectContaining({
        ...pkg,
        version: "1.0.0",
      }),
    );

    await expect(
      pathExists(path.resolve(cwd, `tarball/${pkg.name}-1.0.0.tgz`)),
    ).resolves.toBeTruthy();

    const { exitCode } = await $({
      cwd,
      preferLocal: true,
      reject: false,
    })`npm view ${pkg.name} version --registry ${registry}`;

    expect(exitCode).not.toBe(0);
  });

  it('should skip publish if "package.private" is true', async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      name: "skip-publish-private",
      version: "0.0.0",
      publishConfig: { registry },
      private: true,
    };
    await outputJson(path.resolve(cwd, "package.json"), pkg);
    await $({ cwd })`corepack use npm@latest`;
    await $({ cwd })`npm install`;

    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: NpmPackageContext) => {
      pkgContext = context;
    };

    const result = await publish(
      {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env: process.env,
        repositoryRoot: cwd,
        options: {},
        package: {
          ...pkg,
          path: cwd,
        },
        nextRelease: { channels: [null], version: "1.0.0" },
      } as unknown as PublishContext,
      { tarballDir: "tarball" },
    );

    expect(result).toBeUndefined();

    await expect(readJson(path.resolve(cwd, "package.json"))).resolves.toEqual(
      expect.objectContaining({
        ...pkg,
        version: "1.0.0",
      }),
    );

    await expect(
      pathExists(path.resolve(cwd, `tarball/${pkg.name}-1.0.0.tgz`)),
    ).resolves.toBeTruthy();

    const { exitCode } = await $({
      cwd,
      preferLocal: true,
      reject: false,
    })`npm view ${pkg.name} version --registry ${registry}`;

    expect(exitCode).not.toBe(0);
  });

  it("should skip publish if version is already published", async () => {
    const cwd = temporaryDirectory();
    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );

    const pkg = {
      name: "skip-is-published",
      version: "0.0.0",
      publishConfig: { registry },
    };
    await outputJson(path.resolve(cwd, "package.json"), pkg);
    await $({ cwd })`corepack use npm@latest`;
    await $({ cwd })`npm install`;

    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: NpmPackageContext) => {
      pkgContext = context;
    };

    await publish(
      {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env: process.env,
        repositoryRoot: cwd,
        options: {},
        package: {
          ...pkg,
          path: cwd,
        },
        nextRelease: { channels: [null], version: "1.0.0" },
      } as unknown as PublishContext,
      { tarballDir: "tarball" },
    );
    await publish(
      {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env: process.env,
        repositoryRoot: cwd,
        options: {},
        package: {
          ...pkg,
          path: cwd,
        },
        nextRelease: { channels: [null], version: "1.0.0" },
      } as unknown as PublishContext,
      { tarballDir: "tarball" },
    );

    await expect(readJson(path.resolve(cwd, "package.json"))).resolves.toEqual(
      expect.objectContaining({
        ...pkg,
        version: "1.0.0",
      }),
    );

    await expect(
      pathExists(path.resolve(cwd, `tarball/${pkg.name}-1.0.0.tgz`)),
    ).resolves.toBeTruthy();

    const { stdout } = await $({
      cwd,
      preferLocal: true,
    })`npm view ${pkg.name} version --registry ${registry}`;

    expect(stdout.trim()).toBe("1.0.0");

    expect(warn).toHaveBeenCalled();
  });

  it.each(["8", "latest"])(
    "should publish the package with pnpm %s",
    async (version) => {
      const cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );
      await writeFile(
        path.resolve(cwd, "pnpm-workspace.yaml"),
        `packages:
- "packages/*"
`,
      );

      const packages = [
        {
          name: `publish-pnpm-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: cwd,
        },
        {
          name: `@publish-pnpm-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          name: `@publish-pnpm-${version}/b`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/b"),
        },
      ];

      for (const { path: pkgRoot, ...pkg } of packages) {
        await outputJson(path.resolve(pkgRoot, "package.json"), pkg);
      }

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`pnpm@${version}`}`;
      await $(options)`pnpm install`;

      for (const { path: pkgRoot, ...pkg } of packages) {
        let pkgContext: NpmPackageContext;

        const getPluginPackageContext = () => pkgContext;
        const setPluginPackageContext = (context: NpmPackageContext) => {
          pkgContext = context;
        };

        const result = await publish(
          {
            ...context,
            getPluginPackageContext,
            setPluginPackageContext,
            cwd,
            env: process.env,
            repositoryRoot: cwd,
            options: {},
            package: { ...pkg, path: pkgRoot },
            nextRelease: {
              version: "1.0.0",
              channels: [null, "latest-1"],
            },
          } as unknown as PublishContext,
          {},
        );

        expect(result).toEqual({
          name: NPM_ARTIFACT_NAME,
          url: undefined,
        });

        await expect(
          readJson(path.resolve(pkgRoot, "package.json")),
        ).resolves.toEqual(
          expect.objectContaining({
            ...pkg,
            version: "1.0.0",
          }),
        );

        await expect(
          pathExists(
            path.resolve(
              pkgRoot,
              `${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
            ),
          ),
        ).resolves.toBeFalsy();

        const { stdout: output } = await $({
          cwd,
          preferLocal: true,
        })`pnpm view ${pkg.name} dist-tags --registry ${registry} --json`;

        expect(JSON.parse(output)).toEqual(
          expect.objectContaining({
            latest: "1.0.0",
            "latest-1": "1.0.0",
          }),
        );
      }
    },
  );

  it.each(["3", "latest"])(
    "should publish the package with yarn %s",
    async (version) => {
      const cwd = temporaryDirectory();

      const packages = [
        {
          name: `publish-yarn-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          workspaces: ["packages/*"],
          path: cwd,
        },
        {
          name: `@publish-yarn-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          name: `@publish-yarn-${version}/b`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/b"),
        },
      ];

      for (const { path: pkgRoot, ...pkg } of packages) {
        await outputJson(path.resolve(pkgRoot, "package.json"), pkg);
      }

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`yarn@${version}`}`;

      if (version === "3") {
        await $(options)`yarn plugin import version`;
      }

      await $(options)`yarn install`;
      await $(
        options,
      )`yarn config set unsafeHttpWhitelist --json ${`["${registryHost}"]`}`;
      await $(options)`yarn config set npmRegistryServer ${registry}`;
      await $(
        options,
      )`yarn config set ${`npmScopes["publish-yarn-${version}"].npmRegistryServer`} ${registry}`;
      await $(options)`yarn config set npmAuthToken ${npmToken ?? ""}`;

      for (const { path: pkgRoot, ...pkg } of packages) {
        let pkgContext: NpmPackageContext;

        const getPluginPackageContext = () => pkgContext;
        const setPluginPackageContext = (context: NpmPackageContext) => {
          pkgContext = context;
        };

        const result = await publish(
          {
            ...context,
            getPluginPackageContext,
            setPluginPackageContext,
            cwd,
            env: process.env,
            repositoryRoot: cwd,
            options: {},
            package: { ...pkg, path: pkgRoot },
            nextRelease: {
              version: "1.0.0",
              channels: [null, "latest-1"],
            },
          } as unknown as PublishContext,
          {},
        );

        expect(result).toEqual({
          name: NPM_ARTIFACT_NAME,
          url: undefined,
        });

        await expect(
          readJson(path.resolve(pkgRoot, "package.json")),
        ).resolves.toEqual(
          expect.objectContaining({
            ...pkg,
            version: "1.0.0",
          }),
        );

        await expect(
          pathExists(
            path.resolve(pkgRoot, `${pkg.name.replaceAll("/", "-")}-1.0.0.tgz`),
          ),
        ).resolves.toBeFalsy();

        const { stdout: output } = await $({
          cwd,
          preferLocal: true,
        })`yarn npm info ${pkg.name} --fields dist-tags --json`;

        expect(JSON.parse(output.trim())).toEqual(
          expect.objectContaining({
            "dist-tags": {
              latest: "1.0.0",
              "latest-1": "1.0.0",
            },
          }),
        );
      }
    },
  );

  it.each(["8", "latest"])(
    "should publish the package with npm %s",
    async (version) => {
      const cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      const packages = [
        {
          name: `publish-npm-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          workspaces: ["packages/*"],
          path: cwd,
        },
        {
          name: `@publish-npm-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          name: `@publish-npm-${version}/b`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/b"),
        },
      ];

      for (const { path: pkgRoot, ...pkg } of packages) {
        await outputJson(path.resolve(pkgRoot, "package.json"), pkg);
      }

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`npm@${version}`}`;
      await $(options)`npm install`;

      for (const { path: pkgRoot, ...pkg } of packages) {
        let pkgContext: NpmPackageContext;

        const getPluginPackageContext = () => pkgContext;
        const setPluginPackageContext = (context: NpmPackageContext) => {
          pkgContext = context;
        };

        const result = await publish(
          {
            ...context,
            getPluginPackageContext,
            setPluginPackageContext,
            cwd,
            env: process.env,
            repositoryRoot: cwd,
            options: {},
            package: { ...pkg, path: pkgRoot },
            nextRelease: {
              version: "1.0.0",
              channels: [null, "latest-1"],
            },
          } as unknown as PublishContext,
          {},
        );

        expect(result).toEqual({
          name: NPM_ARTIFACT_NAME,
          url: undefined,
        });

        await expect(
          readJson(path.resolve(pkgRoot, "package.json")),
        ).resolves.toEqual(
          expect.objectContaining({
            ...pkg,
            version: "1.0.0",
          }),
        );

        await expect(
          pathExists(
            path.resolve(
              pkgRoot,
              `${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
            ),
          ),
        ).resolves.toBeFalsy();

        const { stdout: output } = await $({
          cwd,
          preferLocal: true,
        })`npm view ${pkg.name} dist-tags --registry ${registry} --json`;

        expect(JSON.parse(output)).toEqual(
          expect.objectContaining({
            latest: "1.0.0",
            "latest-1": "1.0.0",
          }),
        );
      }
    },
  );
});
