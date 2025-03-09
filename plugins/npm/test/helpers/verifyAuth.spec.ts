import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson } from "fs-extra";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { AnalyzeCommitsContext } from "@lets-release/config";

import { MIN_REQUIRED_PM_VERSIONS } from "src/constants/MIN_REQUIRED_PM_VERSIONS";
import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";
import { verifyAuth } from "src/helpers/verifyAuth";
import { NpmPackageContext } from "src/types/NpmPackageContext";

const registry = inject("registry");
const registryHost = inject("registryHost");
const npmToken = inject("npmToken");
const pkg = {
  name: "verify-auth",
  version: "1.0.0",
  publishConfig: { registry },
};

describe("verifyAuth", () => {
  it.each([MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.pnpm], "latest"])(
    "should verify auth with pnpm %s",
    async (version) => {
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
      await $(options)`corepack use ${`pnpm@${version}`}`;
      await $(options)`pnpm install`;

      await expect(
        verifyAuth(
          { package: { path: cwd } } as AnalyzeCommitsContext,
          {
            pm: { name: "pnpm", root: cwd },
            registry,
          } as NpmPackageContext,
        ),
      ).resolves.toBeUndefined();
    },
  );

  it.each([MIN_REQUIRED_PM_VERSIONS[NpmPackageManagerName.yarn], "latest"])(
    "should verify auth with yarn %s",
    async (version) => {
      const cwd = temporaryDirectory();

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

      await expect(
        verifyAuth(
          { package: { path: cwd } } as AnalyzeCommitsContext,
          {
            pm: { name: "yarn", root: cwd },
            registry,
          } as NpmPackageContext,
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

      await outputJson(path.resolve(cwd, "package.json"), pkg);

      const options = {
        cwd,
        preferLocal: true,
      };
      await $(options)`corepack use ${`npm@${version}`}`;
      await $(options)`npm install`;

      await expect(
        verifyAuth(
          { package: { path: cwd } } as AnalyzeCommitsContext,
          {
            pm: { name: "npm", root: cwd },
            registry,
          } as NpmPackageContext,
        ),
      ).resolves.toBeUndefined();
    },
  );
});
