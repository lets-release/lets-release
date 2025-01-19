import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson } from "fs-extra";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { PublishContext, VerifyReleaseContext } from "@lets-release/config";

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

    await outputJson(path.resolve(cwd, "package.json"), pkg);

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

  describe("pnpm", () => {
    let cwd: string;

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      await outputJson(path.resolve(cwd, "package.json"), pkg);

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use pnpm@latest`;
      await $(options)`pnpm install`;
    });

    it("should return true if the version is published", async () => {
      await expect(
        isVersionPublished(
          {
            package: pkg,
            nextRelease: { version: "1.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "pnpm" }, cwd, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(true);
    });

    it("should return false if the version is not published", async () => {
      await expect(
        isVersionPublished(
          {
            package: pkg,
            nextRelease: { version: "2.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "pnpm" }, cwd, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(false);
    });
  });

  describe("yarn", () => {
    let cwd: string;

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await outputJson(path.resolve(cwd, "package.json"), pkg);

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use yarn@latest`;
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
            package: pkg,
            nextRelease: { version: "1.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "yarn" }, cwd, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(true);
    });

    it("should return false if the version is not published", async () => {
      await expect(
        isVersionPublished(
          {
            package: pkg,
            nextRelease: { version: "2.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "yarn" }, cwd, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(false);
    });
  });

  describe("npm", () => {
    let cwd: string;

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      await outputJson(path.resolve(cwd, "package.json"), pkg);

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`npm install`;
    });

    it("should return true if the version is published", async () => {
      await expect(
        isVersionPublished(
          {
            package: pkg,
            nextRelease: { version: "1.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "npm" }, cwd, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(true);
    });

    it("should return false if the version is not published", async () => {
      await expect(
        isVersionPublished(
          {
            package: pkg,
            nextRelease: { version: "2.0.0" },
          } as unknown as VerifyReleaseContext,
          { pm: { name: "npm" }, cwd, registry } as NpmPackageContext,
        ),
      ).resolves.toBe(false);
    });
  });
});
