import { mkdir, writeFile } from "node:fs/promises";
import { homedir, platform } from "node:os";
import path from "node:path";

import { $ } from "execa";
import stripAnsi from "strip-ansi";
import { temporaryDirectory } from "tempy";
import { TestProject } from "vitest/node";

import { Verdaccio } from "@lets-release/testing";

export default async function setup(project: TestProject) {
  const verdaccio = new Verdaccio("verdaccio-npm", 4874);

  async function startVerdaccio() {
    await verdaccio.pull();
    await verdaccio.start();

    project.provide("registry", verdaccio.url);
    project.provide("registryHost", verdaccio.host);
    project.provide("npmToken", verdaccio.npmToken);
  }

  async function stopVerdaccio() {
    await verdaccio.stop();
  }

  project.onTestsRerun(async () => {
    console.log("[@lets-release/npm]: Restarting Verdaccio");
    await stopVerdaccio();
    await startVerdaccio();
  });

  if (platform() === "win32") {
    // https://github.com/nodejs/corepack/issues/71
    const corepackDir = path.resolve(homedir(), ".corepack");
    await mkdir(corepackDir, { recursive: true });
    await $`corepack enable npm pnpm yarn --install-directory ${corepackDir}`;
  } else {
    await $`corepack enable npm pnpm yarn`;
  }

  console.log("[@lets-release/npm]: Installing pnpm@8");
  await $`corepack install -g pnpm@8`;
  console.log("[@lets-release/npm]: Installing pnpm@latest");
  await $`corepack install -g pnpm@latest`;
  console.log("[@lets-release/npm]: Installing yarn@3");
  await $`corepack install -g yarn@3`;
  console.log("[@lets-release/npm]: Installing yarn@latest");
  await $`corepack install -g yarn@latest`;
  console.log("[@lets-release/npm]: Installing npm@8");
  await $`corepack install -g npm@8`;
  console.log("[@lets-release/npm]: Installing npm@latest");
  await $`corepack install -g npm@latest`;

  console.log("[@lets-release/npm]: Downloading version plugin for yarn@3");
  const { stdout } = await $({ lines: true })`pnpm dist-tag ls @yarnpkg/cli`;
  const yarn3Version = stdout
    .flatMap((line) => {
      const trimmed = stripAnsi(line).trim();

      if (!trimmed) {
        return [];
      }

      return [trimmed.split(":").map((part) => part.trim())];
    })
    .find(([tag]) => tag === "v3")?.[1];
  const response = await fetch(
    `https://github.com/yarnpkg/berry/raw/@yarnpkg/cli/${yarn3Version}/packages/plugin-version/bin/%40yarnpkg/plugin-version.js`,
  );
  const yarn3VersionPlugin = path.resolve(
    temporaryDirectory(),
    "plugin-version.js",
  );
  await writeFile(yarn3VersionPlugin, await response.text());
  project.provide("yarn3VersionPlugin", yarn3VersionPlugin);

  console.log("[@lets-release/npm]: Starting Verdaccio");
  await startVerdaccio();

  return async () => {
    console.log("[@lets-release/npm]: Stopping Verdaccio");
    await stopVerdaccio();
  };
}

declare module "vitest" {
  export interface ProvidedContext {
    registry: string;
    registryHost: string;
    npmToken?: string;
    yarn3VersionPlugin: string;
  }
}
