import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { VerifyConditionsContext } from "@lets-release/config";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";
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
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(pkg, null, 2),
    );
    await $({ cwd })`corepack use npm@latest`;
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
          ciEnv: {},
          env: process.env,
          repositoryRoot: cwd,
          packages: [
            {
              type: "npm",
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
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(pkg, null, 2),
    );
    await $({ cwd })`corepack use npm@latest`;
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
          ciEnv: {},
          env: process.env,
          repositoryRoot: cwd,
          packages: [
            {
              type: "npm",
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
    await writeFile(
      path.resolve(cwd, "package.json"),
      JSON.stringify(pkg, null, 2),
    );
    await $({ cwd })`corepack use npm@latest`;
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
          ciEnv: {},
          env: process.env,
          repositoryRoot: cwd,
          packages: [
            {
              type: "npm",
              ...pkg,
              path: cwd,
            },
          ],
        } as unknown as VerifyConditionsContext,
        {},
      ),
    ).rejects.toThrow(AggregateError);
  });

  it.each([MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.pnpm], "latest"])(
    "should verify auth with pnpm %s",
    async (version) => {
      const cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      const packages = [
        {
          type: "npm",
          name: `verify-conditions-pnpm-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: cwd,
        },
        {
          type: "npm",
          name: `@verify-conditions-pnpm-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          type: "npm",
          name: `@verify-conditions-pnpm-${version}/b`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/b"),
        },
      ];

      for (const { path: pkgRoot, ...pkg } of packages) {
        await mkdir(pkgRoot, { recursive: true });
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
            ciEnv: {},
            env: process.env,
            repositoryRoot: cwd,
            packages,
          } as unknown as VerifyConditionsContext,
          {},
        ),
      ).resolves.toBeUndefined();
    },
  );

  it.each([MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.yarn], "latest"])(
    "should verify auth with yarn %s",
    async (version) => {
      const cwd = temporaryDirectory();

      const packages = [
        {
          type: "npm",
          name: `verify-conditions-yarn-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          workspaces: ["packages/*"],
          path: cwd,
        },
        {
          type: "npm",
          name: `@verify-conditions-yarn-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          type: "npm",
          name: `@verify-conditions-yarn-${version}/b`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/b"),
        },
      ];

      for (const { path: pkgRoot, ...pkg } of packages) {
        await mkdir(pkgRoot, { recursive: true });
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
            ciEnv: {},
            env: process.env,
            repositoryRoot: cwd,
            packages,
          } as unknown as VerifyConditionsContext,
          {},
        ),
      ).resolves.toBeUndefined();
    },
  );

  it.each([MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.npm], "latest"])(
    "should verify auth with npm %s",
    async (version) => {
      const cwd = temporaryDirectory();

      await writeFile(
        path.resolve(cwd, ".npmrc"),
        `//${registry.replace(/^https?:\/\//, "")}/:_authToken=${npmToken}`,
      );

      const packages = [
        {
          type: "npm",
          name: `verify-conditions-npm-${version}`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          workspaces: ["packages/*"],
          path: cwd,
        },
        {
          type: "npm",
          name: `@verify-conditions-npm-${version}/a`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/a"),
        },
        {
          type: "npm",
          name: `@verify-conditions-npm-${version}/b`,
          version: "0.0.0-dev",
          publishConfig: { registry },
          path: path.resolve(cwd, "packages/b"),
        },
      ];

      for (const { path: pkgRoot, ...pkg } of packages) {
        await mkdir(pkgRoot, { recursive: true });
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
            ciEnv: {},
            env: process.env,
            repositoryRoot: cwd,
            packages,
          } as unknown as VerifyConditionsContext,
          {},
        ),
      ).resolves.toBeUndefined();
    },
  );
});
