import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson } from "fs-extra";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { VerifyConditionsContext } from "@lets-release/config";

import { verifyConditions } from "src/steps/verifyConditions";
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

describe("verifyConditions", () => {
  it('should skip npm auth verification if "skipPublishing" is true', async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      name: "skip-verify-conditions-npm-publish",
      version: "1.0.0",
      publishConfig: { registry },
    };
    await outputJson(path.resolve(cwd, "package.json"), pkg);

    await expect(
      verifyConditions(
        {
          ...context,
          cwd,
          env: process.env,
          repositoryRoot: cwd,
          packages: [
            {
              ...pkg,
              path: cwd,
            },
          ],
        } as unknown as VerifyConditionsContext,
        { skipPublishing: true },
      ),
    ).resolves.toBeUndefined();
  });

  it('should skip npm auth verification if "package.private" is true', async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      name: "skip-verify-conditions-private",
      version: "1.0.0",
      publishConfig: { registry },
      private: true,
    };
    await outputJson(path.resolve(cwd, "package.json"), pkg);
    await $({ cwd })`npm install`;

    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (
      type: string,
      name: string,
      context: NpmPackageContext,
    ) => {
      pkgContext = context;
    };

    await expect(
      verifyConditions(
        {
          ...context,
          getPluginPackageContext,
          setPluginPackageContext,
          cwd,
          env: process.env,
          repositoryRoot: cwd,
          packages: [
            {
              ...pkg,
              path: cwd,
            },
          ],
        } as unknown as VerifyConditionsContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should throws error if failed", async () => {
    const cwd = temporaryDirectory();
    const pkg = {
      name: "verify-conditions",
      version: "1.0.0",
      publishConfig: { registry },
    };
    await outputJson(path.resolve(cwd, "package.json"), pkg);
    await $({ cwd })`npm install`;

    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (
      type: string,
      name: string,
      context: NpmPackageContext,
    ) => {
      pkgContext = context;
    };

    await expect(
      verifyConditions(
        {
          ...context,
          getPluginPackageContext,
          setPluginPackageContext,
          cwd,
          env: process.env,
          repositoryRoot: cwd,
          packages: [
            {
              ...pkg,
              path: cwd,
            },
          ],
        } as unknown as VerifyConditionsContext,
        {},
      ),
    ).rejects.toThrow(AggregateError);
  });

  it("should verify auth with pnpm", async () => {
    const cwd = temporaryDirectory();

    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );

    const packages = [
      {
        name: "verify-conditions-pnpm",
        version: "0.0.0-dev",
        publishConfig: { registry },
        path: cwd,
      },
      {
        name: "@verify-conditions-pnpm/a",
        version: "0.0.0-dev",
        publishConfig: { registry },
        path: path.resolve(cwd, "packages/a"),
      },
      {
        name: "@verify-conditions-pnpm/b",
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
    await $(options)`corepack use pnpm@latest`;
    await $(options)`pnpm install`;

    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (
      type: string,
      name: string,
      context: NpmPackageContext,
    ) => {
      pkgContext = context;
    };

    await expect(
      verifyConditions(
        {
          ...context,
          getPluginPackageContext,
          setPluginPackageContext,
          cwd,
          env: process.env,
          repositoryRoot: cwd,
          packages,
        } as unknown as VerifyConditionsContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should verify auth with yarn", async () => {
    const cwd = temporaryDirectory();

    const packages = [
      {
        name: "verify-conditions-yarn",
        version: "0.0.0-dev",
        publishConfig: { registry },
        workspaces: ["packages/*"],
        path: cwd,
      },
      {
        name: "@verify-conditions-yarn/a",
        version: "0.0.0-dev",
        publishConfig: { registry },
        path: path.resolve(cwd, "packages/a"),
      },
      {
        name: "@verify-conditions-yarn/b",
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
    await $(options)`corepack use yarn@latest`;
    await $(options)`yarn install`;
    await $(
      options,
    )`yarn config set unsafeHttpWhitelist --json ${`["${registryHost}"]`}`;
    await $(options)`yarn config set npmRegistryServer ${registry}`;
    await $(options)`yarn config set npmAuthToken ${npmToken ?? ""}`;

    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (
      type: string,
      name: string,
      context: NpmPackageContext,
    ) => {
      pkgContext = context;
    };

    await expect(
      verifyConditions(
        {
          ...context,
          getPluginPackageContext,
          setPluginPackageContext,
          cwd,
          env: process.env,
          repositoryRoot: cwd,
          packages,
        } as unknown as VerifyConditionsContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should verify auth with npm", async () => {
    const cwd = temporaryDirectory();

    await writeFile(
      path.resolve(cwd, ".npmrc"),
      `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
    );

    const packages = [
      {
        name: "verify-conditions-npm",
        version: "0.0.0-dev",
        publishConfig: { registry },
        workspaces: ["packages/*"],
        path: cwd,
      },
      {
        name: "@verify-conditions-npm/a",
        version: "0.0.0-dev",
        publishConfig: { registry },
        path: path.resolve(cwd, "packages/a"),
      },
      {
        name: "@verify-conditions-npm/b",
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
    await $(options)`npm install`;

    let pkgContext: NpmPackageContext;

    const getPluginPackageContext = () => pkgContext;
    const setPluginPackageContext = (
      type: string,
      name: string,
      context: NpmPackageContext,
    ) => {
      pkgContext = context;
    };

    await expect(
      verifyConditions(
        {
          ...context,
          getPluginPackageContext,
          setPluginPackageContext,
          cwd,
          env: process.env,
          repositoryRoot: cwd,
          packages,
        } as unknown as VerifyConditionsContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });
});
