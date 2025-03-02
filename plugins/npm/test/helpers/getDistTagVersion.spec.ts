import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson } from "fs-extra";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { PublishContext, VerifyReleaseContext } from "@lets-release/config";

import { getDistTagVersion } from "src/helpers/getDistTagVersion";
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
  name: "get-dist-tag-version",
  version: "0.0.0-dev",
  publishConfig: { registry },
  path: "",
};
const context = {
  stdout,
  stderr,
  logger,
  package: pkg,
};

describe("getDistTagVersion", () => {
  let pkgContext: NpmPackageContext;

  const getPluginPackageContext = () => pkgContext;
  const setPluginPackageContext = (context: NpmPackageContext) => {
    pkgContext = context;
  };

  beforeAll(async () => {
    const cwd = temporaryDirectory();

    pkg.path = cwd;

    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );

    await outputJson(path.resolve(cwd, "package.json"), pkg);

    const options = {
      cwd,
      preferLocal: true,
    };
    await $(options)`corepack use npm@latest`;
    await $(options)`npm install`;

    for (const { version, channels } of [
      {
        version: "1.0.0",
        channels: [null],
      },
      {
        version: "2.0.0",
        channels: ["next"],
      },
    ]) {
      const ctx = {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env: process.env,
        repositoryRoot: cwd,
        options: {},
        package: pkg,
        nextRelease: {
          version,
          channels,
        },
      } as unknown as PublishContext;
      await prepare(ctx, {});
      await publish(ctx, {});
    }
  });

  it.each(["8", "latest"])(
    "should return the version of the dist-tag with pnpm %s",
    async (version) => {
      const cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      const pkg = {
        name: `get-dist-tag-version-pnpm-${version}`,
        version: "0.0.0-dev",
        publishConfig: { registry },
        path: cwd,
      };

      await outputJson(path.resolve(pkg.path, "package.json"), pkg);

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`pnpm@${version}`}`;
      await $(options)`pnpm install`;

      await expect(
        getDistTagVersion(
          {
            package: { name: "get-dist-tag-version" },
          } as unknown as VerifyReleaseContext,
          pkgContext,
          "latest",
        ),
      ).resolves.toBe("1.0.0");
      await expect(
        getDistTagVersion(
          {
            package: { name: "get-dist-tag-version" },
          } as unknown as VerifyReleaseContext,
          pkgContext,
          "next",
        ),
      ).resolves.toBe("2.0.0");
    },
  );

  it.each(["latest"])(
    "should return the version of the dist-tag with yarn %s",
    async (version) => {
      const cwd = temporaryDirectory();

      const pkg = {
        name: `get-dist-tag-version-yarn-${version}`,
        version: "0.0.0-dev",
        publishConfig: { registry },
        path: cwd,
      };

      await outputJson(path.resolve(pkg.path, "package.json"), pkg);

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

      await expect(
        getDistTagVersion(
          {
            package: { name: "get-dist-tag-version" },
          } as unknown as VerifyReleaseContext,
          pkgContext,
          "latest",
        ),
      ).resolves.toBe("1.0.0");
      await expect(
        getDistTagVersion(
          {
            package: { name: "get-dist-tag-version" },
          } as unknown as VerifyReleaseContext,
          pkgContext,
          "next",
        ),
      ).resolves.toBe("2.0.0");
    },
  );

  it.each(["8", "latest"])(
    "should return the version of the dist-tag with npm %s",
    async (version) => {
      const cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      const pkg = {
        name: `get-dist-tag-version-npm-${version}`,
        version: "0.0.0-dev",
        publishConfig: { registry },
        path: cwd,
      };

      await outputJson(path.resolve(pkg.path, "package.json"), pkg);

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`npm@${version}`}`;
      await $(options)`npm install`;

      await expect(
        getDistTagVersion(
          {
            package: { name: "get-dist-tag-version" },
          } as unknown as VerifyReleaseContext,
          pkgContext,
          "latest",
        ),
      ).resolves.toBe("1.0.0");
      await expect(
        getDistTagVersion(
          {
            package: { name: "get-dist-tag-version" },
          } as unknown as VerifyReleaseContext,
          pkgContext,
          "next",
        ),
      ).resolves.toBe("2.0.0");
    },
  );
});
