import { mkdir } from "node:fs/promises";
import { homedir, platform } from "node:os";
import path from "node:path";

import { $ } from "execa";
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
  console.log("[@lets-release/npm]: Installing yarn@latest");
  await $`corepack install -g yarn@latest`;
  console.log("[@lets-release/npm]: Installing npm@8");
  await $`corepack install -g npm@8`;
  console.log("[@lets-release/npm]: Installing npm@latest");
  await $`corepack install -g npm@latest`;

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
  }
}
