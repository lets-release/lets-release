import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { temporaryDirectory } from "tempy";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";
import { getRegistry } from "src/helpers/getRegistry";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const pkg = {
  name: "test",
  version: "2.0.0",
};
const scope = "@scope";
const scopeRegistry = "https://scope.registry.com/";
const registry = "https://registry.com/";
const anotherRegistry = "https://another.registry.com/";

describe("getRegistry", () => {
  describe.each([
    MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.pnpm],
    "latest",
  ])("pnpm %s", (version) => {
    let cwd = "";

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `${scope}:registry = ${scopeRegistry}
registry = ${registry}`,
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

    it("should get scope registry from .npmrc", async () => {
      await expect(
        getRegistry({ env: process.env, package: { path: cwd } }, {
          pm: { name: "pnpm", root: cwd },
          pkg: {},
          scope,
        } as NpmPackageContext),
      ).resolves.toBe(scopeRegistry);
    });

    it("should get registry from environment variables", async () => {
      await expect(
        getRegistry(
          {
            env: {
              ...process.env,
              npm_config_registry: anotherRegistry,
              NPM_CONFIG_REGISTRY: anotherRegistry,
            },
            package: { path: cwd },
          },
          { pm: { name: "pnpm", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(anotherRegistry);
    });

    it("should get registry from .npmrc", async () => {
      await expect(
        getRegistry(
          {
            env: {
              ...process.env,
              npm_config_registry: undefined,
              NPM_CONFIG_REGISTRY: undefined,
            },
            package: { path: cwd },
          },
          { pm: { name: "pnpm", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(registry);
    });

    it("should get registry from .npmrc in package root over .npmrc in workspace root", async () => {
      const cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, "pnpm-workspace.yaml"),
        `packages:
- packages/*`,
      );
      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `${scope}:registry = ${scopeRegistry}
registry = ${registry}`,
      );
      await writeFile(
        path.resolve(cwd, "package.json"),
        JSON.stringify(pkg, null, 2),
      );

      const pkgRoot = path.resolve(cwd, "packages/a");

      await mkdir(pkgRoot, {
        recursive: true,
      });
      await writeFile(
        path.resolve(pkgRoot, ".npmrc"),
        `${scope}:registry = ${scopeRegistry}
registry = ${anotherRegistry}`,
      );
      await writeFile(
        path.resolve(pkgRoot, "package.json"),
        JSON.stringify(
          {
            name: "pkg",
            version: "1.0.0",
          },
          null,
          2,
        ),
      );

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`pnpm@${version}`}`;
      await $(options)`pnpm install`;

      await expect(
        getRegistry(
          {
            env: {
              ...process.env,
              npm_config_registry: undefined,
              NPM_CONFIG_REGISTRY: undefined,
            },
            package: { path: pkgRoot },
          },
          { pm: { name: "pnpm", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(anotherRegistry);
    });

    it("should get registry from .npmrc in workspace root if .npmrc in package root not exists", async () => {
      const cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, "pnpm-workspace.yaml"),
        `packages:
- packages/*`,
      );
      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `${scope}:registry = ${scopeRegistry}
registry = ${registry}`,
      );
      await writeFile(
        path.resolve(cwd, "package.json"),
        JSON.stringify(pkg, null, 2),
      );

      const pkgRoot = path.resolve(cwd, "packages/a");

      await mkdir(pkgRoot, {
        recursive: true,
      });
      await writeFile(
        path.resolve(pkgRoot, "package.json"),
        JSON.stringify(
          {
            name: "pkg",
            version: "1.0.0",
          },
          null,
          2,
        ),
      );

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`pnpm@${version}`}`;
      await $(options)`pnpm install`;

      await expect(
        getRegistry(
          {
            env: {
              ...process.env,
              npm_config_registry: undefined,
              NPM_CONFIG_REGISTRY: undefined,
            },
            package: { path: pkgRoot },
          },
          { pm: { name: "pnpm", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(registry);
    });
  });

  describe.each([
    MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.yarn],
    "latest",
  ])("yarn %s", (version) => {
    let cwd = "";

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
      await $(options)`yarn config set npmRegistryServer ${registry}`;
      await $(
        options,
      )`yarn config set ${`npmScopes["${scope.replace(/^@/, "")}"].npmRegistryServer`} ${scopeRegistry}`;
    });

    it("should get scope registry from .yarnrc.yml", async () => {
      await expect(
        getRegistry({ env: process.env, package: { path: cwd } }, {
          pm: { name: "yarn", root: cwd },
          pkg: {},
          scope,
        } as NpmPackageContext),
      ).resolves.toBe(scopeRegistry);
    });

    it("should ignore environment variables", async () => {
      await expect(
        getRegistry(
          {
            env: {
              ...process.env,
              npm_config_registry: anotherRegistry,
              NPM_CONFIG_REGISTRY: anotherRegistry,
              yarn_registry: anotherRegistry,
              YARN_REGISTRY: anotherRegistry,
            },
            package: { path: cwd },
          },
          { pm: { name: "yarn", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(registry);
    });

    it("should get registry from .yarnrc.yml", async () => {
      await expect(
        getRegistry(
          {
            env: {
              ...process.env,
              npm_config_registry: undefined,
              NPM_CONFIG_REGISTRY: undefined,
              YARN_REGISTRY: undefined,
            },
            package: { path: cwd },
          },
          { pm: { name: "yarn", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(registry);
    });

    it("should get default yarn registry", async () => {
      const cwd = temporaryDirectory();

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

      await expect(
        getRegistry(
          {
            env: process.env,
            package: { path: cwd },
          },
          { pm: { name: "yarn", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe("https://registry.yarnpkg.com");
    });
  });

  describe.each([
    MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.npm],
    "latest",
  ])("npm %s", (version) => {
    let cwd = "";

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `${scope}:registry = ${scopeRegistry}
registry = ${registry}`,
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

    it("should get scope registry from .npmrc", async () => {
      await expect(
        getRegistry(
          {
            env: process.env,
            package: { path: cwd },
          },
          {
            pm: { name: "npm", root: cwd },
            pkg: {},
            scope,
          } as NpmPackageContext,
        ),
      ).resolves.toBe(scopeRegistry);
    });

    it("should get registry from environment variables", async () => {
      await expect(
        getRegistry(
          {
            env: {
              ...process.env,
              npm_config_registry: anotherRegistry,
              NPM_CONFIG_REGISTRY: anotherRegistry,
            },
            package: { path: cwd },
          },
          { pm: { name: "npm", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(anotherRegistry);
    });

    it("should get registry from .npmrc", async () => {
      await expect(
        getRegistry(
          {
            env: {
              ...process.env,
              npm_config_registry: undefined,
              NPM_CONFIG_REGISTRY: undefined,
            },
            package: { path: cwd },
          },
          { pm: { name: "npm", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(registry);
    });
  });
});
