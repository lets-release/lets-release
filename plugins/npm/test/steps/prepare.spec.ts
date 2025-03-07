/* eslint-disable unicorn/consistent-function-scoping */
import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson, pathExists, readJson } from "fs-extra";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { PrepareContext } from "@lets-release/config";

import { prepare } from "src/steps/prepare";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const registry = inject("registry");
const registryHost = inject("registryHost");
const npmToken = inject("npmToken");
const stdout = new WritableStreamBuffer();
const stderr = new WritableStreamBuffer();
const log = vi.fn();
const logger = { log };
const context = {
  stdout,
  stderr,
  logger,
};

describe("prepare", () => {
  it.each(["8", "latest"])(
    "should prepare the package with pnpm %s",
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
          name: `prepare-pnpm-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: cwd,
        },
        {
          name: `@prepare-pnpm-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          name: `@prepare-pnpm-${version}/b`,
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

        await prepare(
          {
            ...context,
            getPluginPackageContext,
            setPluginPackageContext,
            cwd,
            env: process.env,
            repositoryRoot: cwd,
            options: {},
            package: { ...pkg, path: pkgRoot },
            nextRelease: { version: "1.0.0", channels: { default: [null] } },
          } as unknown as PrepareContext,
          { tarballDir: "tarball" },
        );

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
              `tarball/${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
            ),
          ),
        ).resolves.toBeTruthy();
      }
    },
  );

  it.each(["latest"])(
    "should prepare the package with yarn %s",
    async (version) => {
      const cwd = temporaryDirectory();

      const packages = [
        {
          name: `prepare-yarn-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          workspaces: ["packages/*"],
          path: cwd,
        },
        {
          name: `@prepare-yarn-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          name: `@prepare-yarn-${version}/b`,
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
      await $(options)`yarn install`;
      await $(
        options,
      )`yarn config set unsafeHttpWhitelist --json ${`["${registryHost}"]`}`;
      await $(options)`yarn config set npmRegistryServer ${registry}`;
      await $(
        options,
      )`yarn config set ${`npmScopes["prepare-yarn-${version}"].npmRegistryServer`} ${registry}`;
      await $(options)`yarn config set npmAuthToken ${npmToken ?? ""}`;

      for (const { path: pkgRoot, ...pkg } of packages) {
        let pkgContext: NpmPackageContext;

        const getPluginPackageContext = () => pkgContext;
        const setPluginPackageContext = (context: NpmPackageContext) => {
          pkgContext = context;
        };

        await prepare(
          {
            ...context,
            getPluginPackageContext,
            setPluginPackageContext,
            cwd,
            env: process.env,
            repositoryRoot: cwd,
            options: {},
            package: { ...pkg, path: pkgRoot },
            nextRelease: { version: "1.0.0", channels: { default: [null] } },
          } as unknown as PrepareContext,
          { tarballDir: "tarball" },
        );

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
              `tarball/${pkg.name.replaceAll("/", "-")}-1.0.0.tgz`,
            ),
          ),
        ).resolves.toBeTruthy();
      }
    },
  );

  it.each(["8", "latest"])(
    "should prepare the package with npm %s",
    async (version) => {
      const cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      const packages = [
        {
          name: `prepare-npm-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          workspaces: ["packages/*"],
          path: cwd,
        },
        {
          name: `@prepare-npm-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          name: `@prepare-npm-${version}/b`,
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

        await prepare(
          {
            ...context,
            getPluginPackageContext,
            setPluginPackageContext,
            cwd,
            env: process.env,
            repositoryRoot: cwd,
            options: {},
            package: { ...pkg, path: pkgRoot },
            nextRelease: { version: "1.0.0", channels: { default: [null] } },
          } as unknown as PrepareContext,
          { tarballDir: "tarball" },
        );

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
              `tarball/${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
            ),
          ),
        ).resolves.toBeTruthy();
      }
    },
  );
});
