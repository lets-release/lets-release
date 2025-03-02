import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson, pathExists, readJson } from "fs-extra";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { PrepareContext } from "@lets-release/config";

import { preparePackage } from "src/helpers/preparePackage";
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
  name: "prepare-package",
  version: "0.0.0",
  publishConfig: { registry },
};
const context = {
  stdout,
  stderr,
  logger,
  package: pkg,
};

describe("preparePackage", () => {
  describe.each(["8", "latest"])("pnpm %s", (version) => {
    let cwd: string;
    let ctx: PrepareContext;
    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: NpmPackageContext) => {
      pkgContext = context;
    };

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
      await $(options)`corepack use ${`pnpm@${version}`}`;
      await $(options)`pnpm install`;

      ctx = {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env: process.env,
        repositoryRoot: cwd,
        options: {},
        package: { ...pkg, path: cwd },
        nextRelease: {
          version: "1.0.0",
          channels: [null],
        },
      } as unknown as PrepareContext;
      pkgContext = {
        pm: { name: "pnpm", root: cwd },
        registry,
      } as NpmPackageContext;

      await preparePackage(ctx, pkgContext, { tarballDir: "tarball" });
    });

    it("should write the version to the package.json", async () => {
      await expect(
        readJson(path.resolve(cwd, "package.json")),
      ).resolves.toEqual(
        expect.objectContaining({
          ...pkg,
          version: "1.0.0",
        }),
      );
    });

    it("should pack the package", async () => {
      await expect(
        pathExists(
          path.resolve(
            cwd,
            `tarball/${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
          ),
        ),
      ).resolves.toBeTruthy();
    });
  });

  describe.each(["latest"])("yarn %s", (version) => {
    let cwd: string;
    let ctx: PrepareContext;
    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: NpmPackageContext) => {
      pkgContext = context;
    };

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await outputJson(path.resolve(cwd, "package.json"), pkg);

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

      ctx = {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env: process.env,
        repositoryRoot: cwd,
        options: {},
        package: { ...pkg, path: cwd },
        nextRelease: {
          version: "1.0.0",
          channels: [null],
        },
      } as unknown as PrepareContext;
      pkgContext = {
        pm: { name: "yarn", root: cwd },
        registry,
      } as NpmPackageContext;

      await preparePackage(ctx, pkgContext, { tarballDir: "tarball" });
    });

    it("should write the version to the package.json", async () => {
      await expect(
        readJson(path.resolve(cwd, "package.json")),
      ).resolves.toEqual(
        expect.objectContaining({
          ...pkg,
          version: "1.0.0",
        }),
      );
    });

    it("should pack the package", async () => {
      await expect(
        pathExists(
          path.resolve(
            cwd,
            `tarball/${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
          ),
        ),
      ).resolves.toBeTruthy();
    });
  });

  describe.each(["8", "latest"])("npm %s", (version) => {
    let cwd: string;
    let ctx: PrepareContext;
    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (context: NpmPackageContext) => {
      pkgContext = context;
    };

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
      await $(options)`corepack use ${`npm@${version}`}`;
      await $(options)`npm install`;

      ctx = {
        ...context,
        getPluginPackageContext,
        setPluginPackageContext,
        cwd,
        env: process.env,
        repositoryRoot: cwd,
        options: {},
        package: { ...pkg, path: cwd },
        nextRelease: {
          version: "1.0.0",
          channels: [null],
        },
      } as unknown as PrepareContext;
      pkgContext = {
        pm: { name: "npm", root: cwd },
        registry,
      } as NpmPackageContext;

      await preparePackage(ctx, pkgContext, { tarballDir: "tarball" });
    });

    it("should write the version to the package.json", async () => {
      await expect(
        readJson(path.resolve(cwd, "package.json")),
      ).resolves.toEqual(
        expect.objectContaining({
          ...pkg,
          version: "1.0.0",
        }),
      );
    });

    it("should pack the package", async () => {
      await expect(
        pathExists(
          path.resolve(
            cwd,
            `tarball/${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
          ),
        ),
      ).resolves.toBeTruthy();
    });
  });
});
