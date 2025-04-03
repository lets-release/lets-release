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
  describe.each([
    MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.pnpm],
    "latest",
  ])("pnpm %s", (version) => {
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
      const buffer = await readFile(path.resolve(cwd, "package.json"));

      expect(JSON.parse(buffer.toString())).toEqual(
        expect.objectContaining({
          ...pkg,
          version: "1.0.0",
        }),
      );
    });

    it("should pack the package", () => {
      expect(
        existsSync(
          path.resolve(
            cwd,
            `tarball/${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
          ),
        ),
      ).toBeTruthy();
    });
  });

  describe.each([
    MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.yarn],
    "latest",
  ])("yarn %s", (version) => {
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
      const buffer = await readFile(path.resolve(cwd, "package.json"));

      expect(JSON.parse(buffer.toString())).toEqual(
        expect.objectContaining({
          ...pkg,
          version: "1.0.0",
        }),
      );
    });

    it("should pack the package", () => {
      expect(
        existsSync(
          path.resolve(
            cwd,
            `tarball/${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
          ),
        ),
      ).toBeTruthy();
    });
  });

  describe.each([
    MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.npm],
    "latest",
  ])("npm %s", (version) => {
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
      const buffer = await readFile(path.resolve(cwd, "package.json"));

      expect(JSON.parse(buffer.toString())).toEqual(
        expect.objectContaining({
          ...pkg,
          version: "1.0.0",
        }),
      );
    });

    it("should pack the package", () => {
      expect(
        existsSync(
          path.resolve(
            cwd,
            `tarball/${pkg.name.replaceAll("@", "").replaceAll("/", "-")}-1.0.0.tgz`,
          ),
        ),
      ).toBeTruthy();
    });
  });
});
