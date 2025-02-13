import { writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";
import { outputJson } from "fs-extra";
import { temporaryDirectory } from "tempy";
import { inject } from "vitest";

import { VerifyConditionsContext } from "@lets-release/config";

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
  it("should verify auth with pnpm", async () => {
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

    await expect(
      verifyAuth(
        {} as VerifyConditionsContext,
        {
          pm: { name: "pnpm", root: cwd },
          registry,
        } as NpmPackageContext,
      ),
    ).resolves.toBeUndefined();
  });

  it("should verify auth with yarn", async () => {
    const cwd = temporaryDirectory();

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

    await expect(
      verifyAuth(
        {} as VerifyConditionsContext,
        {
          pm: { name: "yarn", root: cwd },
          registry,
        } as NpmPackageContext,
      ),
    ).resolves.toBeUndefined();
  });

  it("should verify auth with npm", async () => {
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
    await $(options)`npm install`;

    await expect(
      verifyAuth(
        {} as VerifyConditionsContext,
        {
          pm: { name: "npm", root: cwd },
          registry,
        } as NpmPackageContext,
      ),
    ).resolves.toBeUndefined();
  });
});
