import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson } from "fs-extra";
import { temporaryDirectory } from "tempy";

import { VerifyConditionsContext } from "@lets-release/config";

import { DEFAULT_NPM_REGISTRY } from "src/constants/DEFAULT_NPM_REGISTRY";
import { getRegistry } from "src/helpers/getRegistry";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const pkg = {
  name: "test",
  version: "2.0.0",
};
const scope = "@scope";
const scopeRegistry = "https://scope.registry.com";
const registry = "https://registry.com";

describe("getRegistry", () => {
  describe("pnpm", () => {
    let cwd = "";

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `${scope}:registry = ${scopeRegistry}
  registry = ${registry}`,
      );

      await outputJson(path.resolve(cwd, "package.json"), pkg);

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use pnpm@latest`;
      await $(options)`pnpm install`;
    });

    it("should get scope registry", async () => {
      await expect(
        getRegistry(
          { env: process.env } as VerifyConditionsContext,
          {
            pm: { name: "pnpm", root: cwd },
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
              npm_config_registry:
                process.env.npm_config_registry || DEFAULT_NPM_REGISTRY,
            },
          } as unknown as VerifyConditionsContext,
          { pm: { name: "pnpm", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(process.env.npm_config_registry || DEFAULT_NPM_REGISTRY);
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
          } as unknown as VerifyConditionsContext,
          { pm: { name: "pnpm", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(registry);
    });
  });

  describe("yarn", () => {
    let cwd = "";

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await outputJson(path.resolve(cwd, "package.json"), pkg);

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use yarn@latest`;
      await $(options)`yarn install`;
      await $(options)`yarn config set npmRegistryServer ${registry}`;
      await $(
        options,
      )`yarn config set ${`npmScopes["${scope.replace(/^@/, "")}"].npmRegistryServer`} ${scopeRegistry}`;
    });

    it("should get scope registry", async () => {
      await expect(
        getRegistry(
          { env: process.env } as VerifyConditionsContext,
          {
            pm: { name: "yarn", root: cwd },
            pkg: {},
            scope,
          } as NpmPackageContext,
        ),
      ).resolves.toBe(scopeRegistry);
    });

    it("should ignore registry from environment variables", async () => {
      await expect(
        getRegistry(
          {
            env: {
              ...process.env,
              YARN_REGISTRY:
                process.env.npm_config_registry || DEFAULT_NPM_REGISTRY,
            },
          } as unknown as VerifyConditionsContext,
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
            },
          } as unknown as VerifyConditionsContext,
          { pm: { name: "yarn", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(registry);
    });
  });

  describe("npm", () => {
    let cwd = "";

    beforeAll(async () => {
      cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `${scope}:registry = ${scopeRegistry}
registry = ${registry}`,
      );

      await outputJson(path.resolve(cwd, "package.json"), pkg);

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`npm install`;
    });

    it("should get scope registry", async () => {
      await expect(
        getRegistry(
          { env: process.env } as VerifyConditionsContext,
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
              npm_config_registry:
                process.env.npm_config_registry || DEFAULT_NPM_REGISTRY,
            },
          } as unknown as VerifyConditionsContext,
          { pm: { name: "npm", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(process.env.npm_config_registry || DEFAULT_NPM_REGISTRY);
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
          } as unknown as VerifyConditionsContext,
          { pm: { name: "npm", root: cwd }, pkg: {} } as NpmPackageContext,
        ),
      ).resolves.toBe(registry);
    });
  });
});
