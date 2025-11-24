import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { PublishContext, VerifyReleaseContext } from "@lets-release/config";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";
import { isVersionPublished } from "src/helpers/isVersionPublished";
import { prepare } from "src/steps/prepare";
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
const pkg = {
  type: "npm",
  name: "is-version-published",
  version: "1.0.0",
  publishConfig: { registry },
};
const context = {
  stdout,
  stderr,
  logger,
  package: pkg,
};

describe("isVersionPublished", () => {
  beforeAll(async () => {
    const cwd = temporaryDirectory();

    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );

    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(pkg, null, 2),
    );

    const options = {
      cwd,
      preferLocal: true,
    };
    await $(options)`corepack use pnpm@latest`;
    await $(options)`pnpm install`;

    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: NpmPackageContext) => {
      pkgContext = context;
    };

    const ctx = {
      ...context,
      getPluginPackageContext,
      setPluginPackageContext,
      cwd,
      ciEnv: {},
      env: process.env,
      repositoryRoot: cwd,
      options: {},
      package: { ...pkg, path: cwd },
      nextRelease: {
        version: pkg.version,
        channels: [null],
      },
    } as unknown as PublishContext;
    await prepare(ctx, {});
    await publish(ctx, {});
  });

  describe.each([
    MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.pnpm],
    "latest",
  ])("pnpm %s", (version) => {
    let cwd: string;

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      await writeFile(
        path.resolve(cwd, "package.json"),
        JSON.stringify(pkg, null, 2),
      );

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`pnpm@${version}`}`;
      await $(options)`pnpm install`;
    });

    it("should return true if the version is published", async () => {
      await expect(
        isVersionPublished(
          {
            ciEnv: {},
            package: pkg,
            nextRelease: { version: "1.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "pnpm", root: cwd }, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(true);
    });

    it("should return false if the version is not published", async () => {
      await expect(
        isVersionPublished(
          {
            ciEnv: {},
            package: pkg,
            nextRelease: { version: "2.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "pnpm", root: cwd }, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(false);
    });
  });

  describe.each([
    MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.yarn],
    "latest",
  ])("yarn %s", (version) => {
    let cwd: string;

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, "package.json"),
        JSON.stringify(pkg, null, 2),
      );

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
      await $(options)`yarn config set npmAuthToken ${npmToken ?? ""}`;
    });

    it("should return true if the version is published", async () => {
      await expect(
        isVersionPublished(
          {
            ciEnv: {},
            package: pkg,
            nextRelease: { version: "1.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "yarn", root: cwd }, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(true);
    });

    it("should return false if the version is not published", async () => {
      await expect(
        isVersionPublished(
          {
            ciEnv: {},
            package: pkg,
            nextRelease: { version: "2.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "yarn", root: cwd }, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(false);
    });
  });

  describe.each([
    MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.npm],
    "latest",
  ])("npm %s", (version) => {
    let cwd: string;

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      await writeFile(
        path.resolve(cwd, "package.json"),
        JSON.stringify(pkg, null, 2),
      );

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`npm@${version}`}`;
      await $(options)`npm install`;
    });

    it("should return true if the version is published", async () => {
      await expect(
        isVersionPublished(
          {
            ciEnv: {},
            package: pkg,
            nextRelease: { version: "1.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "npm", root: cwd }, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(true);
    });

    it("should return false if the version is not published", async () => {
      await expect(
        isVersionPublished(
          {
            ciEnv: {},
            package: pkg,
            nextRelease: { version: "2.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "npm", root: cwd }, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(false);
    });
  });
});
