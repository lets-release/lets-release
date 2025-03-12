/* eslint-disable unicorn/consistent-function-scoping */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { PrepareContext } from "@lets-release/config";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";
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
  it.each([MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.pnpm], "latest"])(
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

        const buffer = await readFile(path.resolve(pkgRoot, "package.json"));

        expect(JSON.parse(buffer.toString())).toEqual(
          expect.objectContaining({
            ...pkg,
            version: "1.0.0",
          }),
        );

        expect(
          existsSync(
            path.resolve(
              pkgRoot,
              `tarball/${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
            ),
          ),
        ).toBeTruthy();
      }
    },
  );

  it.each([MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.yarn], "latest"])(
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

        const buffer = await readFile(path.resolve(pkgRoot, "package.json"));

        expect(JSON.parse(buffer.toString())).toEqual(
          expect.objectContaining({
            ...pkg,
            version: "1.0.0",
          }),
        );

        expect(
          existsSync(
            path.resolve(
              pkgRoot,
              `tarball/${pkg.name.replaceAll("/", "-")}-1.0.0.tgz`,
            ),
          ),
        ).toBeTruthy();
      }
    },
  );

  it.each([MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.npm], "latest"])(
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

        const buffer = await readFile(path.resolve(pkgRoot, "package.json"));

        expect(JSON.parse(buffer.toString())).toEqual(
          expect.objectContaining({
            ...pkg,
            version: "1.0.0",
          }),
        );

        expect(
          existsSync(
            path.resolve(
              pkgRoot,
              `tarball/${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
            ),
          ),
        ).toBeTruthy();
      }
    },
  );
});
