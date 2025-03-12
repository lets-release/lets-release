/* eslint-disable unicorn/consistent-function-scoping */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { AddChannelsContext, PublishContext } from "@lets-release/config";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { NPM_ARTIFACT_NAME } from "src/constants/NPM_ARTIFACT_NAME";
import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";
import { addChannels } from "src/steps/addChannels";
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

describe("addChannels", () => {
  it('should skip adding channels if "skipPublishing" is true', async () => {
    const cwd = temporaryDirectory();

    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );

    const pkg = {
      name: "skip-add-channels-npm-publish",
      version: "0.0.0",
      publishConfig: { registry },
    };
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(pkg, null, 2),
    );
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
        package: { ...pkg, path: cwd },
        nextRelease: { channels: [null], version: "1.0.0" },
      } as unknown as PublishContext,
      {},
    );

    const result = await addChannels(
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
        nextRelease: { channels: ["next"], version: "1.0.0" },
      } as unknown as AddChannelsContext,
      { skipPublishing: true },
    );

    expect(result).toBeUndefined();

    const { exitCode } = await $({
      cwd,
      preferLocal: true,
      reject: false,
    })`npm view ${pkg.name}@next version --registry ${registry}`;

    expect(exitCode).not.toBe(0);
  });

  it('should skip adding channels if "package.private" is true', async () => {
    const cwd = temporaryDirectory();

    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );

    const pkg = {
      name: "skip-add-channels-private",
      version: "0.0.0",
      publishConfig: { registry },
      private: true,
    };
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(pkg, null, 2),
    );
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
        package: { ...pkg, path: cwd },
        nextRelease: { channels: [null], version: "1.0.0" },
      } as unknown as PublishContext,
      {},
    );

    const result = await addChannels(
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
        nextRelease: { channels: ["next"], version: "1.0.0" },
      } as unknown as AddChannelsContext,
      {},
    );

    expect(result).toBeUndefined();

    const { exitCode } = await $({
      cwd,
      preferLocal: true,
      reject: false,
    })`npm view ${pkg.name}@latest version --registry ${registry}`;

    expect(exitCode).not.toBe(0);
  });

  it.each([MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.pnpm], "latest"])(
    "should add channels with pnpm %s",
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
          name: `add-channels-pnpm-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: cwd,
        },
        {
          name: `@add-channels-pnpm-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          name: `@add-channels-pnpm-${version}/b`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/b"),
        },
      ];

      for (const { path: pkgRoot, ...pkg } of packages) {
        await mkdir(pkgRoot, { recursive: true });
        await writeFile(
          path.resolve(pkgRoot, "package.json"),
          JSON.stringify(pkg, null, 2),
        );
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

        await publish(
          {
            ...context,
            getPluginPackageContext,
            setPluginPackageContext,
            cwd,
            env: process.env,
            repositoryRoot: cwd,
            options: {},
            package: { ...pkg, path: pkgRoot },
            nextRelease: { channels: [null], version: "1.0.0" },
          } as unknown as PublishContext,
          {},
        );

        const result = await addChannels(
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
              channels: ["next", "release-1.x"],
              version: "1.0.0",
            },
          } as unknown as AddChannelsContext,
          {},
        );

        expect(result).toEqual({
          name: NPM_ARTIFACT_NAME,
          url: undefined,
        });

        const { stdout: output } = await $({
          cwd,
          preferLocal: true,
        })`pnpm view ${pkg.name} dist-tags --registry ${registry} --json`;

        expect(JSON.parse(output)).toEqual(
          expect.objectContaining({
            next: "1.0.0",
            "release-1.x": "1.0.0",
          }),
        );
      }
    },
  );

  it.each([MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.yarn], "latest"])(
    "should add channels with yarn %s",
    async (version) => {
      const cwd = temporaryDirectory();

      const packages = [
        {
          name: `add-channels-yarn-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          workspaces: ["packages/*"],
          path: cwd,
        },
        {
          name: `@add-channels-yarn-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          name: `@add-channels-yarn-${version}/b`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/b"),
        },
      ];

      for (const { path: pkgRoot, ...pkg } of packages) {
        await mkdir(pkgRoot, { recursive: true });
        await writeFile(
          path.resolve(pkgRoot, "package.json"),
          JSON.stringify(pkg, null, 2),
        );
      }

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`yarn@${version}`}`;
      await $(options)`yarn install`;
      await $(
        options,
      )`yarn config set unsafeHttpWhitelist --json ${`["${registryHost}"]`}`;
      await $(options)`yarn config set npmRegistryServer ${registry}`;
      await $(
        options,
      )`yarn config set ${`npmScopes["add-channels-yarn-${version}"].npmRegistryServer`} ${registry}`;
      await $(options)`yarn config set npmAuthToken ${npmToken ?? ""}`;

      for (const { path: pkgRoot, ...pkg } of packages) {
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
            package: { ...pkg, path: pkgRoot },
            nextRelease: { channels: [null], version: "1.0.0" },
          } as unknown as PublishContext,
          {},
        );

        const result = await addChannels(
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
              channels: ["next", "release-1.x"],
              version: "1.0.0",
            },
          } as unknown as AddChannelsContext,
          {},
        );

        expect(result).toEqual({
          name: NPM_ARTIFACT_NAME,
          url: undefined,
        });

        const { stdout: output } = await $({
          cwd,
          preferLocal: true,
        })`yarn npm info ${pkg.name} --fields dist-tags --json`;

        expect(JSON.parse(output.trim())).toEqual(
          expect.objectContaining({
            "dist-tags": expect.objectContaining({
              next: "1.0.0",
              "release-1.x": "1.0.0",
            }),
          }),
        );
      }
    },
  );

  it.each([MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.npm], "latest"])(
    "should add channels with npm %s",
    async (version) => {
      const cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      const packages = [
        {
          name: `add-channels-npm-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          workspaces: ["packages/*"],
          path: cwd,
        },
        {
          name: `@add-channels-npm-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          name: `@add-channels-npm-${version}/b`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/b"),
        },
      ];

      for (const { path: pkgRoot, ...pkg } of packages) {
        await mkdir(pkgRoot, { recursive: true });
        await writeFile(
          path.resolve(pkgRoot, "package.json"),
          JSON.stringify(pkg, null, 2),
        );
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

        await publish(
          {
            ...context,
            getPluginPackageContext,
            setPluginPackageContext,
            cwd,
            env: process.env,
            repositoryRoot: cwd,
            options: {},
            package: { ...pkg, path: pkgRoot },
            nextRelease: { channels: [null], version: "1.0.0" },
          } as unknown as PublishContext,
          {},
        );

        const result = await addChannels(
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
              channels: ["next", "release-1.x"],
              version: "1.0.0",
            },
          } as unknown as AddChannelsContext,
          {},
        );

        expect(result).toEqual({
          name: NPM_ARTIFACT_NAME,
          url: undefined,
        });

        const { stdout: output } = await $({
          cwd,
          preferLocal: true,
        })`npm view ${pkg.name} dist-tags --registry ${registry} --json`;

        expect(JSON.parse(output)).toEqual(
          expect.objectContaining({
            next: "1.0.0",
            "release-1.x": "1.0.0",
          }),
        );
      }
    },
  );
});
